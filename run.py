"""
Script hỗ trợ khởi chạy dự án "Chờ vé thông minh" từ môi trường Python / venv.
Giúp người dùng quen dùng Python có thể khởi chạy toàn bộ hệ thống bằng 1 lệnh:
    python run.py
"""

import os
import sys
import subprocess
import shutil

def check_nodejs():
    """Kiểm tra máy đã cài đặt Node.js và npm chưa."""
    node_path = shutil.which("node")
    npm_path = shutil.which("npm")
    
    if not node_path or not npm_path:
        print("\n[!] CẢNH BÁO: Không tìm thấy Node.js hoặc npm trên máy tính của bạn!")
        print("Dự án này sử dụng Next.js (TypeScript + Prisma + SQLite).")
        print("Vui lòng tải và cài đặt Node.js (bản LTS) tại: https://nodejs.org/")
        sys.exit(1)
        
    try:
        node_ver = subprocess.check_output(["node", "-v"], text=True).strip()
        npm_ver = subprocess.check_output(["npm", "-v"], text=True).strip()
        print(f"[OK] Đã phát hiện Node.js {node_ver} và npm {npm_ver}")
    except Exception as e:
        print(f"[!] Lỗi kiểm tra phiên bản: {e}")

def run_command(cmd, desc):
    """Thực thi lệnh shell và hiển thị trạng thái."""
    print(f"\n---> Đang thực hiện: {desc} ({' '.join(cmd)}) ...")
    try:
        # On Windows, shell=True is needed for npm.cmd
        use_shell = sys.platform == "win32"
        ret = subprocess.run(cmd, shell=use_shell, check=True)
        return ret.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"[X] Lỗi khi thực hiện: {desc} (Mã lỗi: {e.returncode})")
        return False
    except KeyboardInterrupt:
        print("\n[!] Đã dừng bởi người dùng.")
        sys.exit(0)

def main():
    print("=" * 65)
    print("   HỆ THỐNG CHỜ VÉ THÔNG MINH (SMART TICKET WAITLIST)   ")
    print("       Trình khởi chạy tiện ích Python / venv Launcher   ")
    print("=" * 65)
    
    # 1. Kiểm tra môi trường Node.js
    check_nodejs()
    
    # Kiểm tra xem node_modules đã tồn tại chưa
    project_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(project_dir)
    
    node_modules_exist = os.path.isdir(os.path.join(project_dir, "node_modules"))
    db_exist = os.path.isfile(os.path.join(project_dir, "prisma", "dev.db"))
    
    if not node_modules_exist:
        print("\n[*] Chưa tìm thấy thư viện node_modules. Đang tiến hành cài đặt...")
        run_command(["npm", "install"], "Cài đặt thư viện npm phụ thuộc")
        
    if not db_exist:
        print("\n[*] Chưa tìm thấy database SQLite. Đang khởi tạo migration và nạp dữ liệu mẫu...")
        run_command(["npx", "prisma", "migrate", "dev"], "Chạy Prisma Migrate")
        run_command(["npm", "run", "seed"], "Nạp dữ liệu mẫu (Seed Data)")
        
    print("\n" + "=" * 65)
    print("  MỜI CHỌN THAO TÁC:")
    print("  1. Khởi động Website (npm run dev) -> http://localhost:3000 (Mặc định)")
    print("  2. Nạp lại dữ liệu mẫu (npm run seed)")
    print("  3. Chạy toàn bộ kiểm thử tự động (npm test)")
    print("  4. Cài đặt lại từ đầu (npm install -> migrate -> seed -> dev)")
    print("  0. Thoát")
    print("=" * 65)
    
    try:
        choice = input("Nhập lựa chọn của bạn [Nhấn Enter để chọn 1]: ").strip()
    except KeyboardInterrupt:
        print("\nTạm biệt!")
        sys.exit(0)
        
    if choice == "" or choice == "1":
        print("\n[*] Đang khởi động máy chủ Web...")
        print("[*] Mở trình duyệt và truy cập: http://localhost:3000\n")
        run_command(["npm", "run", "dev"], "Chạy máy chủ Next.js")
    elif choice == "2":
        run_command(["npm", "run", "seed"], "Nạp dữ liệu mẫu")
    elif choice == "3":
        run_command(["npm", "test"], "Chạy Vitest kiểm thử tự động")
    elif choice == "4":
        run_command(["npm", "install"], "Cài đặt thư viện")
        run_command(["npx", "prisma", "migrate", "dev"], "Khởi tạo database")
        run_command(["npm", "run", "seed"], "Nạp dữ liệu mẫu")
        print("\n[*] Khởi động máy chủ Web...")
        run_command(["npm", "run", "dev"], "Chạy máy chủ Next.js")
    elif choice == "0":
        print("Tạm biệt!")
        sys.exit(0)
    else:
        print("[!] Lựa chọn không hợp lệ.")

if __name__ == "__main__":
    main()
