import { useMutation, useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient, API_ENDPOINTS } from '@services/api';
import { User } from '@stores/authStore';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

export interface MyClubsRequest {
  pageNumber: number;
  pageSize: number;
  search: string;
}

export interface MyClubsResponse {

  apiName: string;
  data: any[];
  message: string;
  success: boolean;
}




// API service functions
export const mainService = {



  myClubs: async (params: MyClubsRequest): Promise<ApiResponse<MyClubsResponse>> => {
    const response = await apiClient.get(API_ENDPOINTS.CLUB.SEARCH_MY_CLUBS, {
      params: params,
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    };
  },
}



export const useInfiniteMyClubs = (search: string, pageSize: number) => {
  return useInfiniteQuery({
    queryKey: ['infiniteMyClubs', search, pageSize],
    queryFn: ({ pageParam = 0 }) =>
      mainService.myClubs({
        search: '',
        pageNumber: pageParam,
        pageSize
      }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length - 1;
      const totalRecords = lastPage?.data?.data?.[0]?.totalRecord || 0;
      const totalPages = Math.ceil(totalRecords / pageSize);

      // Return next page number if there are more pages
      return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });
};