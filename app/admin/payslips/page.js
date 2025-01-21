'use client';
import { useState } from 'react';

export default function PayslipsPage() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);

  const generatePayslips = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payslip/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      });

      const data = await response.json();
      if (data.success) {
        setPayslips(data.payslips);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }

    const downloadPayslip = async (employeeId) => {
      try {
        const response = await fetch(`/api/admin/payslip/download?employeeId=${employeeId}&month=${month}&year=${year}`);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip-${employeeId}-${month}-${year}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading payslip:', error);
      }
    };

    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Payslip Management</h1>

        <div className="flex gap-4 mb-6">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="border p-2 rounded"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border p-2 rounded"
          >
            {Array.from({ length: 5 }, (_, i) => (
              <option key={i} value={new Date().getFullYear() - 2 + i}>
                {new Date().getFullYear() - 2 + i}
              </option>
            ))}
          </select>

          <button
            onClick={generatePayslips}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Generating...' : 'Generate Payslips'}
          </button>
        </div>

        {payslips.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Generated Payslips</h2>
            <div className="grid gap-4">
              {payslips.map((payslip) => (
                <div key={payslip.id} className="border p-4 rounded flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Employee ID: {payslip.employeeId}</p>
                    <p>Paid Days: {payslip.paidDays}</p>
                    <p>Net Payable: ₹{payslip.netPayable.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => downloadPayslip(payslip.employeeId)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}