import urllib.request
import urllib.error

def run_verification():
    url = "http://127.0.0.1:8000/api/tickets"
    target_origin = "https://datastraw-6stz5jcsj-ganeshraj4020-6278s-projects.vercel.app"
    
    print(f"Target URL: {url}")
    print(f"Target Origin: {target_origin}\n")
    
    # 1. Test OPTIONS preflight request
    print("--- 1. Testing OPTIONS Preflight request ---")
    req_options = urllib.request.Request(
        url,
        method="OPTIONS",
        headers={
            "Origin": target_origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "content-type"
        }
    )
    try:
        with urllib.request.urlopen(req_options) as resp:
            headers = resp.info()
            print("Status code:", resp.status)
            print("Access-Control-Allow-Origin:", headers.get("Access-Control-Allow-Origin"))
            print("Access-Control-Allow-Methods:", headers.get("Access-Control-Allow-Methods"))
            print("Access-Control-Allow-Headers:", headers.get("Access-Control-Allow-Headers"))
            print("Access-Control-Allow-Credentials:", headers.get("Access-Control-Allow-Credentials"))
    except urllib.error.HTTPError as e:
        print("OPTIONS failed with HTTPError code:", e.code)
    except Exception as e:
        print("OPTIONS failed with Exception:", e)

    # 2. Test GET request with Origin
    print("\n--- 2. Testing GET request ---")
    req_get = urllib.request.Request(
        url,
        method="GET",
        headers={
            "Origin": target_origin
        }
    )
    try:
        with urllib.request.urlopen(req_get) as resp:
            headers = resp.info()
            print("Status code:", resp.status)
            print("Access-Control-Allow-Origin:", headers.get("Access-Control-Allow-Origin"))
            print("Access-Control-Allow-Credentials:", headers.get("Access-Control-Allow-Credentials"))
    except urllib.error.HTTPError as e:
        print("GET failed with HTTPError code:", e.code)
    except Exception as e:
        print("GET failed with Exception:", e)

if __name__ == "__main__":
    run_verification()
