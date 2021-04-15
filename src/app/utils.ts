



export const dataToTable = (htmlId: string, rows: any) => {

    const table = document.getElementById(htmlId) as HTMLTableElement;

    rows.reverse()

    for (const row of rows) {

        const newRow = table.insertRow(0);

        for (let i = 0; i < row.length; i++) {

            const cell = newRow.insertCell(i);
            if (typeof row[i] === 'string' || typeof row[i] === 'number') {
                cell.innerHTML = row[i]
            }
            else {
                cell.innerHTML = JSON.stringify(row[i])
            }

        }




    }
}