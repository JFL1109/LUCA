import openpyxl

wb = openpyxl.load_workbook(r"c:\Users\james\Documents\Code\LUCA\Land Use Change Assessor - LUCA (V3).xlsm", data_only=True)
ws = wb['LU-Baseline']

print("Row 3 values:")
for i, cell in enumerate(ws[3]):
    print(f"Col {i+1}: '{cell.value}'")

print("\nRow 12 Catchments from Assumptions:")
ws_a = wb['Assumptions']
for i, cell in enumerate(ws_a[12]):
    if cell.value:
        print(f"Col {i+1}: '{cell.value}'")
