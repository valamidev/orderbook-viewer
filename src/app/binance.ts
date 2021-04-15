import axios from "axios";

const BASE_URL = `https://api.binance.com`;

export const GetExchangeInfo = async (): Promise<any> => {
    // /api/v3/exchangeInfo

    const response = await axios.get(`${BASE_URL}/api/v3/exchangeInfo`);

    return response.data;
}

export const GetOrderBook = async (symbol = 'ETHUSDT', limit = 5000): Promise<{ asks: any[], bids: any[] }> => {
    // /api/v3/depth

    const response = await axios.get(`${BASE_URL}/api/v3/depth?symbol=${symbol}&limit=${limit}`);

    return response.data;
}