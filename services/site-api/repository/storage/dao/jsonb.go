package dao

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

type JSONColumn[T any] struct {
	Val T
}

func NewJSONColumn[T any](v T) JSONColumn[T] {
	return JSONColumn[T]{Val: v}
}

func (c JSONColumn[T]) Value() (driver.Value, error) {
	b, err := json.Marshal(c.Val)
	if err != nil {
		return nil, err
	}

	return string(b), nil
}

func (c *JSONColumn[T]) Scan(src any) error {
	if src == nil {
		var zero T
		c.Val = zero
		return nil
	}

	switch v := src.(type) {
	case []byte:
		if len(v) == 0 {
			return nil
		}

		return json.Unmarshal(v, &c.Val)
	case string:
		if v == "" {
			return nil
		}

		return json.Unmarshal([]byte(v), &c.Val)
	default:
		return fmt.Errorf("dao: cannot scan %T into JSONColumn", src)
	}
}
