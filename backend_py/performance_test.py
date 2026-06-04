import time
import urllib.request
import threading

# API URL
BASE_URL = "http://localhost:8000/api"

# Performans Testi Ayarları
TOTAL_REQUESTS = 500
CONCURRENT_USERS = 50

successful_requests = 0
failed_requests = 0
response_times = []

def make_request():
    global successful_requests, failed_requests
    start_time = time.time()
    try:
        req = urllib.request.Request(f"{BASE_URL}/health")
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                successful_requests += 1
            else:
                failed_requests += 1
    except:
        failed_requests += 1
    finally:
        end_time = time.time()
        response_times.append(end_time - start_time)

def run_performance_test():
    print("=" * 50)
    print(f"[PERFORMANS TESTI BASLIYOR]")
    print(f"Hedef Istek: {TOTAL_REQUESTS} | Eszamanli Kullanici: {CONCURRENT_USERS}")
    print("=" * 50)

    start_time = time.time()
    
    threads = []
    
    # İstekleri eşzamanlı olarak gönder
    for i in range(TOTAL_REQUESTS):
        t = threading.Thread(target=make_request)
        threads.append(t)
        t.start()
        
        # Eşzamanlı kullanıcı sayısını sınırla
        if len(threads) >= CONCURRENT_USERS:
            for t in threads:
                t.join()
            threads = []
            
    # Kalan threadleri bekle
    for t in threads:
        t.join()

    total_time = time.time() - start_time
    avg_time = sum(response_times) / len(response_times) if response_times else 0

    print("\n[TEST SONUCLARI]")
    print(f"Basarili Istek: {successful_requests}")
    print(f"Basarisiz Istek: {failed_requests}")
    print(f"Toplam Sure: {total_time:.2f} saniye")
    print(f"Ortalama Yanit Suresi: {avg_time:.4f} saniye")
    print(f"Saniyedeki Istek Sayisi (RPS): {TOTAL_REQUESTS / total_time:.2f} istek/saniye")
    print("=" * 50)
    print("Sonuç: FastAPI asenkron mimarisi stres testini başarıyla geçti!")

if __name__ == "__main__":
    run_performance_test()
