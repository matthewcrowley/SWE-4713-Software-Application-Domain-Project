const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Fetch accounts
    const accounts = await db.collection("accounts").find({}).toArray();

    // If no accounts, return zeros
    if (!accounts || accounts.length === 0) {
      return res.json({
        grossProfitMargin: 0,
        operatingProfitMargin: 0,
        netProfitMargin: 0,
        returnOnAssets: 0,
        returnOnEquity: 0,
        currentRatio: 0,
        quickRatio: 0,
        inventoryToNetWorkingCapital: 0,
        debtToAssets: 0,
        debtToEquity: 0,
        longTermDebtToEquity: 0,
        timesInterestEarned: 0,
        inventoryTurnover: 0,
        fixedAssetTurnover: 0,
        totalAssetTurnover: 0,
        accountsReceivableTurnover: 0,
        averageCollectionPeriod: 0,
      });
    }

    // Safe division helper
    const safeDivide = (num, den) => 
      den && den !== 0 ? num / den : 0;

    // Helper to sum account balances by type
    const sumByType = (type) => {
      return accounts
        .filter(a => a.type?.toLowerCase() === type.toLowerCase())
        .reduce((sum, a) => sum + (parseFloat(a.balance) || 0), 0);
    };

    // Helper to find specific accounts
    const findAccount = (searchTerm) => {
      return accounts.find(a => 
        a.account_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    };

    // Calculate totals from account balances
    const totalRevenue = Math.abs(sumByType('Revenue'));
    const totalExpenses = Math.abs(sumByType('Expense'));
    const totalAssets = Math.abs(sumByType('Asset'));
    const totalLiabilities = Math.abs(sumByType('Liability'));
    const totalEquity = Math.abs(sumByType('Equity'));

    // Find specific accounts
    const inventoryAccount = findAccount('inventory');
    const receivableAccount = findAccount('receivable');
    const cogsAccount = findAccount('cost of goods') || findAccount('cogs');
    
    const inventory = Math.abs(parseFloat(inventoryAccount?.balance) || 0);
    const accountsReceivable = Math.abs(parseFloat(receivableAccount?.balance) || 0);
    const cogs = Math.abs(parseFloat(cogsAccount?.balance) || 0);

    // Calculate derived figures
    const grossProfit = totalRevenue - cogs;
    const netIncome = totalRevenue - totalExpenses;
    const currentAssets = accounts
      .filter(a => a.type === 'Asset' && a.subcategory?.toLowerCase().includes('current'))
      .reduce((sum, a) => sum + Math.abs(parseFloat(a.balance) || 0), 0);
    const currentLiabilities = accounts
      .filter(a => a.type === 'Liability' && a.subcategory?.toLowerCase().includes('current'))
      .reduce((sum, a) => sum + Math.abs(parseFloat(a.balance) || 0), 0);

    // Compute financial ratios
    const ratios = {
      // Profitability
      grossProfitMargin: safeDivide(grossProfit, totalRevenue),
      operatingProfitMargin: safeDivide(netIncome, totalRevenue),
      netProfitMargin: safeDivide(netIncome, totalRevenue),
      returnOnAssets: safeDivide(netIncome, totalAssets),
      returnOnEquity: safeDivide(netIncome, totalEquity),

      // Liquidity
      currentRatio: safeDivide(currentAssets, currentLiabilities),
      quickRatio: safeDivide(currentAssets - inventory, currentLiabilities),
      inventoryToNetWorkingCapital: safeDivide(inventory, currentAssets - currentLiabilities),

      // Leverage
      debtToAssets: safeDivide(totalLiabilities, totalAssets),
      debtToEquity: safeDivide(totalLiabilities, totalEquity),
      longTermDebtToEquity: 0, // Can add if you have long-term debt accounts
      timesInterestEarned: 0, // Can add if you have interest expense account

      // Activity
      inventoryTurnover: safeDivide(cogs, inventory),
      fixedAssetTurnover: safeDivide(totalRevenue, totalAssets),
      totalAssetTurnover: safeDivide(totalRevenue, totalAssets),
      accountsReceivableTurnover: safeDivide(totalRevenue, accountsReceivable),
      averageCollectionPeriod: safeDivide(accountsReceivable, totalRevenue / 365),
    };

    res.json(ratios);
  } catch (error) {
    console.error("Error calculating financial ratios:", error);
    res.status(500).json({ error: "Failed to calculate financial ratios" });
  }
});

module.exports = router;