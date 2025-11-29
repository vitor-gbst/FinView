package analysis

import (
	"math"
	"time"
)

// TimeSeriesDataPoint represents a single point in a time series.
type TimeSeriesDataPoint struct {
	Date  time.Time `json:"date"`
	Value float64   `json:"value"`
}

// AnalysisResult holds the results of a financial analysis.
type AnalysisResult struct {
	Type        string                `json:"type"`
	Column      string                `json:"column"`
	Count       int                   `json:"count"`
	Sum         float64               `json:"sum"`
	Mean        float64               `json:"mean"`
	StdDev      float64               `json:"std_dev"`
	TotalReturn float64               `json:"total_return"`
	Series      []TimeSeriesDataPoint `json:"series"`
}

// CalculateTimeSeriesAnalysis performs analysis on a time series.
func CalculateTimeSeriesAnalysis(series []TimeSeriesDataPoint, analysisType, columnName string) *AnalysisResult {
	if len(series) == 0 {
		return &AnalysisResult{Type: analysisType, Column: columnName}
	}

	// Extract values for statistical calculation
	data := make([]float64, len(series))
	for i, point := range series {
		data[i] = point.Value
	}

	count := len(data)
	var sum float64
	for _, val := range data {
		sum += val
	}

	var mean float64
	if count > 0 {
		mean = sum / float64(count)
	}

	var stdDev float64
	if count > 1 {
		var variance float64
		for _, val := range data {
			variance += math.Pow(val-mean, 2)
		}
		stdDev = math.Sqrt(variance / float64(count-1))
	}

	var totalReturn float64
	if count > 1 {
		initialValue := series[0].Value
		finalValue := series[len(series)-1].Value
		if initialValue != 0 {
			totalReturn = ((finalValue - initialValue) / initialValue) * 100
		}
	}

	return &AnalysisResult{
		Type:        analysisType,
		Column:      columnName,
		Count:       count,
		Sum:         sum,
		Mean:        mean,
		StdDev:      stdDev,
		TotalReturn: totalReturn,
		Series:      series,
	}
}

// CalculateBasicAnalysis performs basic statistical calculations on a slice of float64 data.
func CalculateBasicAnalysis(data []float64, analysisType, columnName string) *AnalysisResult {
	count := len(data)
	var sum float64
	for _, val := range data {
		sum += val
	}

	var mean float64
	if count > 0 {
		mean = sum / float64(count)
	}

	var stdDev float64
	if count > 1 {
		var variance float64
		for _, val := range data {
			variance += math.Pow(val-mean, 2)
		}
		stdDev = math.Sqrt(variance / float64(count-1))
	}

	// Convert basic data to time series for consistent response structure
	series := make([]TimeSeriesDataPoint, len(data))
	for i, val := range data {
		// Use a zero time for non-time-series data
		series[i] = TimeSeriesDataPoint{Date: time.Time{}, Value: val}
	}

	return &AnalysisResult{
		Type:        analysisType,
		Column:      columnName,
		Count:       count,
		Sum:         sum,
		Mean:        mean,
		StdDev:      stdDev,
		TotalReturn: 0, // No concept of return without time
		Series:      series,
	}
}
