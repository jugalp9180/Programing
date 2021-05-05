import React, { useState, useEffect } from "react";
import ReactTable from 'react-table';
import "./App.css";
import _ from 'lodash';
import getApiData from './service/transactionDataModel';

function findResults(incomingData) {

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pointsEachTransaction = incomingData.map(transaction=> {
    let points = 0;
    let over100 = transaction.amt - 100;
    
    if (over100 > 0) {
      points += (over100 * 2);
    }    
    if (transaction.amt > 50) {
      points += 50;      
    }
    const month = new Date(transaction.transactionDt).getMonth();
    return {...transaction, points, month};
  });
               
  let byCustomer = {};
  let totalPointsByCustomer = {};
  pointsEachTransaction.forEach(pointsPerTransaction => {
    let {custid, name, month, points} = pointsPerTransaction;   
    if (!byCustomer[custid]) {
      byCustomer[custid] = [];      
    }    
    if (!totalPointsByCustomer[custid]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[custid][month]) {
      byCustomer[custid][month].points += points;
      byCustomer[custid][month].monthNumber = month;
      byCustomer[custid][month].numTransactions++;      
    }
    else {
      
      byCustomer[custid][month] = {
        custid,
        name,
        monthNumber:month,
        month: months[month],
        numTransactions: 1,        
        points
      }
    }    
  });
  let tot = [];
  for (var custKey in byCustomer) {    
    byCustomer[custKey].forEach(cRow=> {
      tot.push(cRow);
    });    
  }
  let totByCustomer = [];
  for (custKey in totalPointsByCustomer) {    
    totByCustomer.push({
      name: custKey,
      points: totalPointsByCustomer[custKey]
    });    
  }
  return {
    summaryByCustomer: tot,
    pointsEachTransaction,
    totalPointsByCustomer:totByCustomer
  };
}

function App() {
  const [transactionData, setTransactionData] = useState(null);
  
  const columns = [
    {
      Header:'Customer',
      accessor: 'name'      
    },    
    {
      Header:'Month',
      accessor: 'month'
    },
    {
      Header: "No of Transactions",
      accessor: 'numTransactions'
    },
    {
      Header:'Reward Points',
      accessor: 'points'
    }
  ];

  function getPerTransaction(row) {
    let byCustMonth = _.filter(transactionData.pointsEachTransaction, (tRow)=>{
      return row.original.custid === tRow.custid && row.original.monthNumber === tRow.month;
    });
    return byCustMonth;
  }

  useEffect(() => { 
    getApiData().then((data)=> {
      const results = findResults(data);      
      setTransactionData(results);
    });
  },[]);

  if (transactionData == null) {
    return <div>Fetching the data...</div>;   
  }

  return (
      <div style={{margin: '30px 20px'}}>
        <div>
          <h2>Reward System</h2>
        </div>
        <div>
          <ReactTable
            data={transactionData.summaryByCustomer}
            defaultPageSize={7}
            columns={columns}
            SubComponent={row => {
              return (
                <div>
                  {
                    getPerTransaction(row).map(tran=>{
                      return <div className="container">
                        <div className="row">
                          <div className="col-8">
                            <strong>Transaction Date:</strong> {tran.transactionDt} - <strong>$</strong>{tran.amt} - <strong>Points: </strong>{tran.points}
                          </div>
                        </div>
                      </div>
                    })
                  }                                    

                </div>
              )
            }}
            />             
        </div>
      </div>
    )
}

export default App;
