import asyncio
import os
from dotenv import load_dotenv
from browser_use import Agent, Browser, ChatOpenAI

# Load environment variables
load_dotenv()

# Konfigurasi OpenAI API Key (wajib untuk browser-use)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("❌ Error: OPENAI_API_KEY not found in environment variables")
    print("   Please set OPENAI_API_KEY in your .env file")
    exit(1)

# URL aplikasi (sesuai .env.example: http://localhost:3000)
APP_URL = "http://localhost:3000"

async def main():
    print(f"🚀 Starting browser-use verification for: {APP_URL}")
    print("=" * 60)
    
    # Setup LLM (OpenAI)
    llm = ChatOpenAI(model="gpt-4o-mini", reasoning_effort="low")
    
    # Setup browser agent
    agent = Agent(
        task=f"""
        Verifikasi aplikasi Sistem Informisa Desa (sid-desa) di {APP_URL}.
        
        Lakukan hal-hal berikut dan beri laporan lengkap:
        
        1. Buka halaman utama {APP_URL} dan periksa apakah halaman terbuka dengan benar
        2. Cek apakah navbar/headers menampilkan logo atau nama aplikasi "Sistem Informasi Desa"
        3. Periksa apakah ada link navigasi ke halaman publik (seperti: desa, layanan-mandiri, konten, dll)
        4. Cek halaman "/desa" atau halaman utama desa untuk pastikan data desa terload
        5. Ambil screenshot halaman utama dan simpan sebagai "screenshot-home.png"
        6. Verifikasi bahwa halaman tidak error (tidak ada error JavaScript yang terlihat)
        
        Format laporan:
        - Status: BERHASIL/GAGAL
        - URL: {APP_URL}
        - Waktu akses: [timestamp]
        - Temuan: [daftar temuan]
        - Screenshot: saved jika berhasil
        """,
        llm=llm,
        # Gunakan cloud browser atau local - untuk lokal kita gunakanuse_cloud=False
        # tapi butuh setup browser. Untuk sekarang pakai cloud default.
    )
    
    try:
        print("🔍 Memulai verifikasi...")
        history = await agent.run()
        
        result = history.final_result()
        print("\n" + "=" * 60)
        print("📊 LAVERIFIKASI SELESAI")
        print("=" * 60)
        print(result)
        
        # Cek apakah screenshot disimpan
        if os.path.exists("screenshot-home.png"):
            print("\n📸 Screenshot telah disimpan: screenshot-home.png")
            
    except Exception as e:
        print(f"\n❌ Error during verification: {e}")
        print("   Pastikan:")
        print("   1. Aplikasi Next.js sedang berjalan di http://localhost:3000")
        print("   2. OpenAI API key valid")
        print("   3. Koneksi internet stabil")

if __name__ == "__main__":
    asyncio.run(main())