export default function ForceAdmin() {
  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-mono mb-4">ADMIN PANEL ACCESS</h1>
        <p className="text-xl font-mono">This is the admin login page</p>
        <p className="text-sm font-mono mt-4">Route: /admin is working</p>
        
        <div className="mt-8 p-4 border border-green-400">
          <h2 className="text-lg font-mono mb-2">Admin Credentials:</h2>
          <p className="font-mono">Email: admin@cyberhunt.com</p>
          <p className="font-mono">Password: AdminSecure123!</p>
        </div>
        
        <button 
          onClick={() => {
            console.log("Admin login clicked");
            // Simple login form would go here
          }}
          className="mt-4 px-6 py-2 border border-green-400 bg-green-400/10 text-green-400 font-mono hover:bg-green-400/20"
        >
          LOGIN TO ADMIN
        </button>
      </div>
    </div>
  );
}