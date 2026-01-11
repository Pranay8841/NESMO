import axios from "axios"
import type { Method, AxiosRequestHeaders } from "axios";

export const axiosInstance = axios.create({});

export const apiConnector = (
    method: Method, 
    url: string, 
    bodyData?: Record<string, any> | null, 
    headers?: AxiosRequestHeaders | null, 
    params?: Record<string, unknown> | null
) => {
    return axiosInstance({
        method:`${method}`,
        url:`${url}`,
        data: bodyData || undefined,
        headers: headers || undefined,
        params: params || undefined,
    });
}