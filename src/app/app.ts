import { GetOrderBook } from "./binance"
import { OBA } from 'orderbook-analysis';
import { Chart } from "chart.js";
import { drawStatTable } from "./statistics";
import { dataToTable } from "./utils";



export const Start = async () => {

    // Load Orderbook
    const rawOrderbook = await GetOrderBook();

    const OrderBook = new OBA(rawOrderbook);

    await Process(OrderBook);

}

export const Process = async (orderBook: OBA) => {

    const bidDepths: { depth: number, label: string, colorBg: string }[] = [];
    const askDepths: { depth: number, label: string, colorBg: string }[] = [];


    for (let i = 1; i <= 10; i++) {
        const pct = Math.floor(i * 0.0025 * 10000) / 100;

        const depths = orderBook.calc('depthByPercent', 0 + (i * 0.0025)) as any;


        bidDepths.push({ depth: depths.down, label: `-${pct} %`, colorBg: `rgba(75, 192, 192,   1)` });
        askDepths.push({ depth: depths.up, label: `+${pct} %`, colorBg: `rgba(255, 99, 132, 1)` });
    }


    const stats = drawStatTable(orderBook).reverse();
    bidDepths.reverse();


    new Chart(document.getElementById('barDepthChart') as any, {
        type: 'bar',
        data: {
            labels: [...bidDepths.map(e => e.label), ...askDepths.map(e => e.label)],
            datasets: [{
                label: 'Depth',
                data: [...bidDepths.map(e => e.depth), ...askDepths.map(e => e.depth)],
                backgroundColor: [
                    ...bidDepths.map(e => e.colorBg), ...askDepths.map(e => e.colorBg)
                ],
                borderWidth: 0
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'XRP/USDT Depth'
                }
            }
        }
    });

    new Chart(document.getElementById('pieDepthChart') as any, {
        type: 'pie',
        data: {
            labels: [...bidDepths.map(e => e.label), ...askDepths.map(e => e.label)],
            datasets: [{
                label: 'Depth',
                data: [...bidDepths.map(e => e.depth), ...askDepths.map(e => e.depth)],
                backgroundColor: [
                    ...bidDepths.map(e => e.colorBg), ...askDepths.map(e => e.colorBg)
                ],
                borderWidth: 0
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'XRP/USDT Depth'
                }
            }
        }
    });


    const quartilesData: any[] = [];

    for (const stat of stats) {

        if (stat.method === 'quartilesByAsksPrice') {
            quartilesData.push(stat.value['0']);
            quartilesData.push(stat.value['25']);
            quartilesData.push(stat.value['50']);
            quartilesData.push(stat.value['75']);
            quartilesData.push(stat.value['100']);
        }
        if (stat.method === 'quartilesByBidsPrice') {
            quartilesData.push(stat.value['100']);
            quartilesData.push(stat.value['75']);
            quartilesData.push(stat.value['50']);
            quartilesData.push(stat.value['25']);
            quartilesData.push(stat.value['0']);
        }

        const table = document.getElementById("statTable") as HTMLTableElement;
        const row = table.insertRow(0);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerHTML = stat.method;
        cell2.innerHTML = JSON.stringify(stat.value);

    }



    dataToTable("quartiles", [[...quartilesData.map(e => Math.round(e * 1000) / 1000)]])





}
