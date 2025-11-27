import { ClubSearchRequest, ClubSearchResponse } from '../services/authService';

export interface ClubData {
  id?: string | number;
  name?: string;
  clubName?: string;
  image?: string;
  profileImage?: string;
  logo?: string;
  members?: number;
  memberCount?: number;
  address?: string;
  location?: string;
  clubCode?: string;
  color?: string;
  description?: string;
}

export interface PaginationState {
  clubs: ClubData[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasMoreData: boolean;
  error: string | null;
}

export class ClubSearchManager {
  private state: PaginationState;
  private onStateChange: (state: PaginationState) => void;
  private searchClubs: (params: ClubSearchRequest) => Promise<any>;
  private pageSize: number;

  constructor(
    onStateChange: (state: PaginationState) => void,
    searchClubs: (params: ClubSearchRequest) => Promise<any>,
    pageSize: number = 5
  ) {
    this.onStateChange = onStateChange;
    this.searchClubs = searchClubs;
    this.pageSize = pageSize;
    
    this.state = {
      clubs: [],
      currentPage: 0,
      totalPages: 0,
      totalCount: 0,
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      hasMoreData: true,
      error: null,
    };
  }

  // Initial load
  async loadInitialData(): Promise<void> {
    this.setState({
      ...this.state,
      isLoading: true,
      error: null,
    });

    try {
      const response = await this.searchClubs({
        pageNumber: 1,
        pageSize: this.pageSize,
      });

      console.log('response1', response);
      const data = response?.data?.data || {};
      const clubs = data || [];
      
      this.setState({
        ...this.state,
        clubs,
        currentPage: 1,
        totalPages: data?.totalPages || 0,
        totalCount: data?.totalCount || 0,
        isLoading: false,
        hasMoreData: clubs.length < (data?.totalCount || 0),
        error: null,
      });
    } catch (error: any) {
      this.setState({
        ...this.state,
        isLoading: false,
        error: error?.message || 'Failed to load clubs',
      });
    }
  }

  // Load more data (pagination)
  async loadMoreData(): Promise<void> {
    if (this.state.isLoadingMore || !this.state.hasMoreData) {
      return;
    }

    const nextPage = this.state.currentPage + 1;

    this.setState({
      ...this.state,
      isLoadingMore: true,
      error: null,
    });

    try {
      const response = await this.searchClubs({
        pageNumber: nextPage,
        pageSize: this.pageSize,
      });

      console.log('response2', response);

      const data = response?.data?.data || {};
      const newClubs = data || [];
      
      this.setState({
        ...this.state,
        clubs: [...this.state.clubs, ...newClubs],
        currentPage: nextPage,
        totalPages: data?.totalPages || 0,
        totalCount: data?.totalCount || 0,
        isLoadingMore: false,
        hasMoreData: this.state.clubs.length + newClubs.length < (data?.totalCount || 0),
        error: null,
      });
    } catch (error: any) {
      this.setState({
        ...this.state,
        isLoadingMore: false,
        error: error?.message || 'Failed to load more clubs',
      });
    }
  }

  // Pull to refresh
  async refreshData(): Promise<void> {
    this.setState({
      ...this.state,
      isRefreshing: true,
      error: null,
    });

    try {
      const response = await this.searchClubs({
        pageNumber: 1,
        pageSize: this.pageSize,
      });


      console.log('response3', response);

      const data = response?.data?.data || {};
      const clubs = data || [];
      
      this.setState({
        ...this.state,
        clubs,
        currentPage: 0,
        totalPages: data?.totalPages || 0,
        totalCount: data?.totalCount || 0,
        isRefreshing: false,
        hasMoreData: clubs.length < (data?.totalCount || 0),
        error: null,
      });
    } catch (error: any) {
      this.setState({
        ...this.state,
        isRefreshing: false,
        error: error?.message || 'Failed to refresh clubs',
      });
    }
  }

  // Reset data
  resetData(): void {
    this.setState({
      clubs: [],
      currentPage: 0,
      totalPages: 0,
      totalCount: 0,
      isLoading: false,
      isLoadingMore: false,
      isRefreshing: false,
      hasMoreData: true,
      error: null,
    });
  }

  // Get current state
  getState(): PaginationState {
    return { ...this.state };
  }

  // Set state helper
  private setState(newState: PaginationState): void {
    this.state = newState;
    this.onStateChange(newState);
  }

  // Check if we can load more
  canLoadMore(): boolean {
    return this.state.hasMoreData && !this.state.isLoadingMore && !this.state.isLoading;
  }

  // Get loading footer text
  getLoadingFooterText(): string {
    if (this.state.isLoadingMore) {
      return 'Loading more clubs...';
    }
    if (!this.state.hasMoreData && this.state.clubs.length > 0) {
      return 'No more clubs to load';
    }
    return '';
  }
}

export default ClubSearchManager;
