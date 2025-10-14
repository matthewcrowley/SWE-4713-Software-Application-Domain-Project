import React from 'react';
import {useParams} from 'react-router-dom';

const Ledger = () => {
  const {accountId} = useParams();

  return (
    <div>
      <h1>Ledger for Account: {accountId}</h1>
      <p>Here you would show the ledger entries for account {accountId}.</p>
    </div>
  );
};

export default Ledger;