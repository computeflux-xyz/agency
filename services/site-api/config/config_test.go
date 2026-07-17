package config

import (
	"os"
	"path/filepath"
	"testing"

	config_helper "github.com/computeflux-xyz/base-go/config"
	"github.com/spf13/viper"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestConfig(t *testing.T) {
	configFile := `server:
  port: 8080
  host: "0.0.0.0"
`
	viper.Reset()

	dir := t.TempDir()
	file := filepath.Join(dir, "config.yaml")
	err := os.WriteFile(file, []byte(configFile), 0600)
	require.NoError(t, err)

	cfg, err := config_helper.New[Config](
		config_helper.WithConfigFilePath(file),
	)

	expected := &Config{
		Server: Server{
			Port: 8080,
			Host: "0.0.0.0",
		},
	}

	require.NoError(t, err)
	assert.Equal(t, expected, cfg)
}
