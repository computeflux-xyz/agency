package contracts

type SortOrder string

const (
	SortOrderAsc  SortOrder = "asc"
	SortOrderDesc SortOrder = "desc"
)

const (
	DefaultPageSize = 12
	MaxPageSize     = 100
)

type Pagination struct {
	Page     int
	PageSize int
}

func DefaultPagination() Pagination {
	return Pagination{Page: 1, PageSize: DefaultPageSize}
}

func (p Pagination) Normalized() Pagination {
	out := p
	if out.Page < 1 {
		out.Page = 1
	}

	if out.PageSize <= 0 {
		out.PageSize = DefaultPageSize
	}

	if out.PageSize > MaxPageSize {
		out.PageSize = MaxPageSize
	}

	return out
}

func (p Pagination) Offset() int {
	return (p.Page - 1) * p.PageSize
}

func (p Pagination) Limit() int {
	return p.PageSize
}
