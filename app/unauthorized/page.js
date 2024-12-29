export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-600">401 - Unauthorized</h1>
        <p className="mt-4">You do not have permission to access this page.</p>
      </div>
    </div>
  );
} 