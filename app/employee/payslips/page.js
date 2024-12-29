'use client';
import { useState, useEffect } from 'react';

export default function EmployeePayslipsPage() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const response = await fetch('/api/employee/payslips');
      const data = await response.json();
      setPayslips(data);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = async (month, year) => {
    try {
      const response = await fetch(`/api/employee/payslip/download?month=${month}&year=${year}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${month}-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading payslip:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Payslips</h1>
      
      {payslips.length > 0 ? (
        <div className="grid gap-4">
          {payslips.map((payslip) => (
            <div key={payslip.id} className="border p-4 rounded flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {new Date(payslip.year, payslip.month - 1).toLocaleString('default', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
                <p>Paid Days: {payslip.paidDays}</p>
                <p>Net Payable: ₹{payslip.netPayable.toFixed(2)}</p>
              </div>
              <button
                onClick={() => downloadPayslip(payslip.month, payslip.year)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Download PDF
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No payslips available.</p>
      )}
    </div>
  );
} 