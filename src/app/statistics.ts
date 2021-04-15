import { OBA } from "orderbook-analysis";
import { MethodName } from "orderbook-analysis/dist/types";


const methods = [
    'medianByAsksPrice',
    'medianByBidsPrice',
    'varianceByAsksPrice',
    'varianceByBidsPrice',
    'linearRegressionByAsks',
    'linearRegressionByBids',
    'skewnessByAsksPrice',
    'skewnessByBidsPrice',
    'kurtosisByAsksPrice',
    'kurtosisByBidsPrice',
    'quartilesByAsksPrice',
    'quartilesByBidsPrice',
];


export const drawStatTable = (orderbook: OBA): { method: string, value: any }[] => {

    const result = [];

    for (const method of methods) {
        const value = orderbook.calc(method as MethodName);

        result.push({ method, value });
    }

    return result;
}