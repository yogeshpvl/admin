import axios from 'axios';
import React, { useEffect, useState } from 'react';

function PaymentReports() {
  const [WalletHistory, setWalletHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5); // Change this number to increase/decrease rows per page

  // Fetch the wallet history when the component mounts
  useEffect(() => {
    fetchWalletHistory();
  }, []);

  const fetchWalletHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:8500/payments-details`);
      setWalletHistory(res.data.transactions || []);
    } catch (err) {
      console.error("Error fetching wallet history:", err);
    }
  };

  // Format the date in a human-readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Pagination logic to slice the wallet history array
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = WalletHistory.slice(indexOfFirstRow, indexOfLastRow);

  // Handling page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <h1>Payment Reports</h1>
      {/* Table to display wallet history */}
      <table border="1" cellPadding="10" style={{ width: '100%', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Payment ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Payment Date</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((entry) => (
            <tr key={entry._id}>
              <td>{entry.orderId}</td>
              <td>{entry.paymentId}</td>
              <td>{entry.amount}</td>
              <td>{entry.status}</td>
              <td>{formatDate(entry.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1} 
          style={{ marginRight: '10px' }}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage * rowsPerPage >= WalletHistory.length} 
          style={{ marginLeft: '10px' }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PaymentReports;
