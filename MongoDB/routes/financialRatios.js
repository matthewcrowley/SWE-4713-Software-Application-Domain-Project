const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Fetch accounts and journal entries
    const accounts = await db.collection("accounts").find({}).toArray();
    const journalEntries = await db.collection("journalEntries").find({ status: "Approved" }).toArray();

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

    // Calculate balances from journal entries
    const accountBalances = new Map();
    
    // Initialize all accounts with zero balance
    accounts.forEach(account => {
      accountBalances.set(account.account_number, {
        balance: 0,
        type: account.type,
        subcategory: account.subcategory,
        name: account.account_name
      });
    });

    // Process journal entries to calculate balances
    journalEntries.forEach(entry => {
      if (entry.debits && Array.isArray(entry.debits)) {
        entry.debits.forEach(debit => {
          const accountData = accountBalances.get(debit.account_number);
          if (accountData) {
            const amount = parseFloat(debit.amount) || 0;
            // Debits increase Assets/Expenses, decrease Liabilities/Equity/Revenue
            if (accountData.type === 'Asset' || accountData.type === 'Expense') {
              accountData.balance += amount;
            } else {
              accountData.balance -= amount;
            }
          }
        });
      }

      if (entry.credits && Array.isArray(entry.credits)) {
        entry.credits.forEach(credit => {
          const accountData = accountBalances.get(credit.account_number);
          if (accountData) {
            const amount = parseFloat(credit.amount) || 0;
            // Credits increase Liabilities/Equity/Revenue, decrease Assets/Expenses
            if (accountData.type === 'Liability' || accountData.type === 'Equity' || accountData.type === 'Revenue') {
              accountData.balance += amount;
            } else {
              accountData.balance -= amount;
            }
          }
        });
      }
    });

    // Safe division helper
    const safeDivide = (num, den) => 
      den && den !== 0 ? num / den : 0;

    // Helper to sum balances by type
    const sumByType = (type) => {
      let sum = 0;
      accountBalances.forEach(account => {
        if (account.type?.toLowerCase() === type.toLowerCase()) {
          sum += Math.abs(account.balance);
        }
      });
      return sum;
    };

    // Helper to find specific accounts
    const findAccountBalance = (searchTerm) => {
      for (let [accountNumber, accountData] of accountBalances) {
        if (accountData.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
          return Math.abs(accountData.balance);
        }
      }
      return 0;
    };

    // Calculate totals from account balances
    const totalRevenue = sumByType('Revenue');
    const totalExpenses = sumByType('Expense');
    const totalAssets = sumByType('Asset');
    const totalLiabilities = sumByType('Liability');
    const totalEquity = sumByType('Equity');

    // Find specific accounts
    const inventory = findAccountBalance('inventory');
    const accountsReceivable = findAccountBalance('receivable');
    const cogs = findAccountBalance('cost of goods') || findAccountBalance('cogs');

    // Calculate derived figures
    const grossProfit = totalRevenue - cogs;
    const netIncome = totalRevenue - totalExpenses;
    
    let currentAssets = 0;
    let currentLiabilities = 0;
    
    accountBalances.forEach(account => {
      if (account.type === 'Asset' && account.subcategory?.toLowerCase().includes('current')) {
        currentAssets += Math.abs(account.balance);
      }
      if (account.type === 'Liability' && account.subcategory?.toLowerCase().includes('current')) {
        currentLiabilities += Math.abs(account.balance);
      }
    });

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