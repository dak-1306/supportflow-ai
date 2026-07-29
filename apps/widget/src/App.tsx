import { ChatWidget } from "@/components/ChatWidget";

function App() {
  return (
    <div className="w-full h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Website Khách Hàng Giả Lập
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          Bong bóng chat nằm ở góc dưới bên phải màn hình.
        </p>
      </div>

      <ChatWidget />
    </div>
  );
}

export default App;
