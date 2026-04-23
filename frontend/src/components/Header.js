import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function Header({ darkMode, setDarkMode, page }) {

  const generatePDF = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/resources");
      const data = await res.json();

      const doc = new jsPDF();

      doc.setFillColor(47, 54, 84);
      doc.rect(0, 0, 210, 30, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("Smart Campus Resource Report", 14, 18);

      const date = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.text(`Generated: ${date}`, 140, 18);

      doc.setTextColor(0, 0, 0);

      const tableData = data.map((item) => [
        item.resourceCode,
        item.name,
        item.type,
        item.capacity,
        item.status,
        item.availabilityWindow,
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Code", "Name", "Type", "Capacity", "Status", "Time"]],
        body: tableData,
      });

      doc.save("SmartCampus_Report.pdf");

    } catch (err) {
      console.error(err);
      alert("PDF generate error!");
    }
  };

  const title = page === "resources" ? "Resource Inventory" : "Dashboard";

  return (
    <header
      className={`rounded-3xl border px-6 py-5 ${
        darkMode
          ? "bg-[#1e293b] text-white"
          : "bg-white/70 text-[#30364f]"
      }`}
    >
      <div className="flex justify-between items-center">

        {/* LEFT */}
        <div>
          <p className="text-sm uppercase opacity-70">Smart Campus</p>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => alert("Login Clicked")}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl"
          >
            Login
          </button>

          <button onClick={generatePDF}>📄</button>

          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "🌙" : "☀️"}
          </button>

        </div>
      </div>
    </header>
  );
}

export default Header;