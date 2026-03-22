"""
install_deps.py — Run this ONCE to fix missing module errors in Jupyter.

Instructions:
1. Open a terminal (Anaconda Prompt or regular Command Prompt)
2. Run:  python install_deps.py
3. Then restart your Jupyter Notebook kernel

This installs all required packages into the active Python environment.
"""
import subprocess, sys

packages = [
    "pandas", "numpy", "scikit-learn", "requests",
    "fastapi", "uvicorn", "python-dotenv", "matplotlib",
    "seaborn", "jupyter", "ipykernel",
]

print("Installing required packages...")
for pkg in packages:
    print(f"  Installing {pkg}...")
    subprocess.run([sys.executable, "-m", "pip", "install", pkg, "--quiet"], check=False)

print("\nAll done! Please restart your Jupyter Notebook kernel now.")
print("In Jupyter: Kernel → Restart Kernel")
