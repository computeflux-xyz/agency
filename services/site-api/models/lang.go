package models

import "strings"

type Lang string

const (
	LangEN Lang = "en"
	LangFR Lang = "fr"

	LangDefault = LangEN
)

var SupportedLangs = []Lang{LangEN, LangFR}

func (l Lang) Valid() bool {
	switch l {
	case LangEN, LangFR:
		return true
	default:
		return false
	}
}

func (l Lang) String() string { return string(l) }

func ParseLang(s string) Lang {
	s = strings.ToLower(strings.TrimSpace(s))
	if s == "" {
		return LangDefault
	}

	if i := strings.IndexAny(s, "-_"); i >= 0 {
		s = s[:i]
	}

	if l := Lang(s); l.Valid() {
		return l
	}

	return LangDefault
}
