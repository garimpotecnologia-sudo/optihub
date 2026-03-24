#!/usr/bin/env python3
"""Deploy static Next.js export to Hostinger FTP"""

import ftplib
import os
import sys

FTP_HOST = "195.200.3.32"
FTP_USER = "u703858642.apresentacao.agentproia.com"
FTP_PASS = "Kgxomryvvd45@"
LOCAL_DIR = "/Users/nicolas/optihub/out"
REMOTE_DIR = "/public_html/testehub"

def ensure_remote_dir(ftp, path):
    """Create remote directory tree if it doesn't exist."""
    dirs = path.split("/")
    current = ""
    for d in dirs:
        if not d:
            continue
        current += "/" + d
        try:
            ftp.cwd(current)
        except ftplib.error_perm:
            try:
                ftp.mkd(current)
                print(f"  [mkdir] {current}")
            except ftplib.error_perm:
                pass

def upload_directory(ftp, local_path, remote_path):
    """Recursively upload a directory."""
    file_count = 0
    for item in sorted(os.listdir(local_path)):
        local_item = os.path.join(local_path, item)
        remote_item = remote_path + "/" + item

        if os.path.isdir(local_item):
            ensure_remote_dir(ftp, remote_item)
            file_count += upload_directory(ftp, local_item, remote_item)
        else:
            try:
                with open(local_item, "rb") as f:
                    ftp.storbinary(f"STOR {remote_item}", f)
                file_count += 1
                if file_count % 20 == 0:
                    print(f"  [{file_count} files uploaded...]")
            except Exception as e:
                print(f"  [ERROR] {remote_item}: {e}")
    return file_count

def main():
    print(f"Connecting to {FTP_HOST}...")
    ftp = ftplib.FTP(FTP_HOST, timeout=30)
    ftp.login(FTP_USER, FTP_PASS)
    print(f"Connected. Server: {ftp.getwelcome()}")

    # Create base directory
    print(f"\nCreating {REMOTE_DIR}...")
    ensure_remote_dir(ftp, REMOTE_DIR)

    # Upload
    print(f"\nUploading {LOCAL_DIR} -> {REMOTE_DIR}...")
    total = upload_directory(ftp, LOCAL_DIR, REMOTE_DIR)

    print(f"\nDone! {total} files uploaded.")
    print(f"URL: https://testehub.agentproia.com/")

    ftp.quit()

if __name__ == "__main__":
    main()
