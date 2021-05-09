import { GetExchangeInfo, GetOrderBook } from "./binance"
import { OBA } from 'orderbook-analysis';
import { Chart } from "chart.js";
import { drawStatTable } from "./statistics";
import { dataToTable } from "./utils";



export const Start = async () => {

    // Load Exchange Info
    const exchangeInfo = await GetExchangeInfo();

    //  console.log(exchangeInfo.symbols);

    const defaultSymbols = ['ETHUSDT', 'XRPUSDT', 'BTCUSDT', 'BNBUSDT'];

    // Load Orderbook
    await Process(exchangeInfo, 'ETHUSDT');


    const selector = document.getElementById('symbolSelect') as HTMLSelectElement;

    for (const symbol of exchangeInfo.symbols) {
        if (defaultSymbols.indexOf(symbol.symbol) === -1) {
            const opt = document.createElement("option");
            opt.value = symbol.symbol;
            opt.text = `${symbol.baseAsset} / ${symbol.quoteAsset}`;

            selector.add(opt, null);
        }

    }


    selector.addEventListener('change', async (e) => {

        const newSymbol = (e.target as any).value || 'ETHUSDT';

        await Process(exchangeInfo, newSymbol);

    });

}

export const Process = async (exchangeInfo: any, symbol: string) => {

    const title = `${exchangeInfo.symbols.find((e: any) => e.symbol === symbol).baseAsset} / ${exchangeInfo.symbols.find((e: any) => e.symbol === symbol).quoteAsset}`

    const rawOrderbook = await GetOrderBook(exchangeInfo.symbols.find((e: any) => e.symbol === symbol).symbol);

    const orderBook = new OBA(rawOrderbook);

    const bidDepths: { depth: number, depthSumDown: number, label: string, colorBg: string }[] = [];
    const askDepths: { depth: number, depthSumUp: number, label: string, colorBg: string }[] = [];



    for (let i = 1; i <= 10; i++) {
        const pct = Math.floor(i * 0.0025 * 10000) / 100;


        const depths = orderBook.calc('depthByPercent', 0 + (i * 0.0025)) as any;

        let depthSumUp = depths.up;
        let depthSumDown = depths.down;

        if (i > 1) {
            const prevDepths = orderBook.calc('depthByPercent', 0 + ((i - 1) * 0.0025)) as any;

            depthSumUp = depths.up - prevDepths.up;
            depthSumDown = depths.down - prevDepths.down;
        }






        bidDepths.push({ depth: depths.down, depthSumDown, label: `-${pct} %`, colorBg: `rgba(75, 192, 192,   1)` });
        askDepths.push({ depth: depths.up, depthSumUp, label: `+${pct} %`, colorBg: `rgba(255, 99, 132, 1)` });
    }


    const stats = drawStatTable(orderBook).reverse();
    bidDepths.reverse();


    if (window.barChart) {
        window.barChart.destroy();
    }

    if (window.pieChart) {
        window.pieChart.destroy();
    }

    window.barChart = new Chart(document.getElementById('barDepthChart') as any, {
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
                    text: `${title} Depth`
                }
            }
        }
    });

    window.pieChart = new Chart(document.getElementById('pieDepthChart') as any, {
        type: 'pie',
        data: {
            labels: [...bidDepths.map(e => e.label), ...askDepths.map(e => e.label)],
            datasets: [{
                label: 'Depth',
                data: [...bidDepths.map(e => e.depthSumDown), ...askDepths.map(e => e.depthSumUp)],
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
                    text: `${title} Depth`
                }
            }
        }
    });


    const quartilesData: any[] = [];

    const table = document.getElementById("statTable") as HTMLTableElement;
    table.innerHTML = '';

    for (const stat of stats) {

        if (stat.method === 'quartilesByAsksPrice') {
            quartilesData.push(stat.value['0']);
            quartilesData.push(stat.value['25']);
            quartilesData.push(stat.value['50']);
            quartilesData.push(stat.value['75']);
            quartilesData.push(stat.value['100']);
            continue;
        }
        if (stat.method === 'quartilesByBidsPrice') {
            quartilesData.push(stat.value['100']);
            quartilesData.push(stat.value['75']);
            quartilesData.push(stat.value['50']);
            quartilesData.push(stat.value['25']);
            quartilesData.push(stat.value['0']);
            continue;
        }


        const row = table.insertRow(0);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        cell1.innerHTML = stat.method;
        cell2.innerHTML = JSON.stringify(stat.value);

    }



    dataToTable("quartiles", [[...quartilesData.map(e => Math.round(e * 1000) / 1000)]])





}
