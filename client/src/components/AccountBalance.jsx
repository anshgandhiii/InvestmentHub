export function AccountBalance() {
  return (
    <div className="card bg-base-100 shadow-md p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Account Balance</h3>
        <button className="btn btn-sm btn-outline">Add Funds</button>
      </div>
      <p className="text-xl font-bold">Rs.12,580.25</p>
      <p className="text-gray-500 text-sm">Last deposit: Rs.2,000 on Mar 10, 2025</p>
    </div>
  );
}