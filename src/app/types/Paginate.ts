export interface IPaginateResponse<T> {
	data: T[];
	total: number;
	currentPage: number;
	totalPage: number;
}