package analysis

import (
	"math"
	"sort"
	"time"
)

type TimeSeriesDataPoint struct {
	Date  time.Time `json:"date"`
	Value float64   `json:"value"`
}

type FinancialHealth struct {
	CurrentBalance float64 `json:"current_balance"`
	BurnRate       float64 `json:"burn_rate"`       
	RunwayMonths   float64 `json:"runway_months"`   
	Status         string  `json:"status"`         
	Message        string  `json:"message"`         
	PredictedDate  string  `json:"predicted_date"`  
}

type CashFlowSummary struct {
	TotalInflow  float64 `json:"total_inflow"`  
	TotalOutflow float64 `json:"total_outflow"` 
}

type AnalysisResult struct {
	Type        string                `json:"type"`
	Column      string                `json:"column"`
	Count       int                   `json:"count"`
	Sum         float64               `json:"sum"`
	Mean        float64               `json:"mean"`
	StdDev      float64               `json:"std_dev"`
	TotalReturn float64               `json:"total_return"`
	Series      []TimeSeriesDataPoint `json:"series"`


	//Graphs
	BalanceSeries []TimeSeriesDataPoint `json:"balance_series"` 
	FlowSummary   CashFlowSummary       `json:"flow_summary"`   
	Health        FinancialHealth       `json:"health"`         
}

func CalculateTimeSeriesAnalysis(series []TimeSeriesDataPoint, analysisType, columnName string) *AnalysisResult {
	if len(series) == 0 {
		return &AnalysisResult{Type: analysisType, Column: columnName}
	}

	sort.Slice(series, func(i, j int) bool {
		return series[i].Date.Before(series[j].Date)
	})

	data := make([]float64, len(series))
	var sum float64
	for i, point := range series {
		data[i] = point.Value
		sum += point.Value
	}

	count := len(data)
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
			totalReturn = ((finalValue - initialValue) / math.Abs(initialValue)) * 100
		}
	}

	var balanceSeries []TimeSeriesDataPoint
	var totalInflow, totalOutflow float64
	currentBalance := 0.0

	for _, p := range series {
		if p.Value >= 0 {
			totalInflow += p.Value
		} else {
			totalOutflow += math.Abs(p.Value)
		}

		currentBalance += p.Value
		balanceSeries = append(balanceSeries, TimeSeriesDataPoint{
			Date:  p.Date,
			Value: currentBalance,
		})
	}

	health := calculateHealth(series, currentBalance, totalOutflow)

	return &AnalysisResult{
		Type:          analysisType,
		Column:        columnName,
		Count:         count,
		Sum:           sum,
		Mean:          mean,
		StdDev:        stdDev,
		TotalReturn:   totalReturn,
		Series:        series,        
		BalanceSeries: balanceSeries, 
		FlowSummary: CashFlowSummary{
			TotalInflow:  totalInflow,
			TotalOutflow: totalOutflow,
		},
		Health: health,
	}
}

func calculateHealth(series []TimeSeriesDataPoint, currentBalance, totalOutflow float64) FinancialHealth {
	if len(series) < 2 {
		return FinancialHealth{Status: "Dados insuficientes"}
	}

	firstDate := series[0].Date
	lastDate := series[len(series)-1].Date
	hoursDiff := lastDate.Sub(firstDate).Hours()
	monthsDiff := hoursDiff / (24 * 30) 

	if monthsDiff < 1 {
		monthsDiff = 1 
	}

	burnRate := totalOutflow / monthsDiff

	
	netCashFlow := currentBalance / monthsDiff 

	runwayMonths := 0.0
	status := "Indefinido"
	message := ""
	predictedDate := ""

	if netCashFlow >= 0 {
		status = "Lucrativo"
		message = "A empresa gera caixa positivo. Sem risco iminente."
		runwayMonths = 999
	} else {
		netBurn := math.Abs(netCashFlow)

		if currentBalance > 0 {
			runwayMonths = currentBalance / netBurn
			
			futureDate := time.Now().AddDate(0, 0, int(runwayMonths*30))
			predictedDate = futureDate.Format("02/01/2006")

			if runwayMonths < 3 {
				status = "Crítico"
				message = "Atenção máxima! Caixa para menos de 3 meses."
			} else if runwayMonths < 6 {
				status = "Alerta"
				message = "Cuidado. Caixa para menos de 6 meses."
			} else {
				status = "Saudável"
				message = "Situação estável no médio prazo."
			}
		} else {
			status = "Insolvente"
			message = "Operação no vermelho. Necessário aporte imediato."
			runwayMonths = 0
		}
	}

	return FinancialHealth{
		CurrentBalance: currentBalance,
		BurnRate:       burnRate,
		RunwayMonths:   runwayMonths,
		Status:         status,
		Message:        message,
		PredictedDate:  predictedDate,
	}
}

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

	series := make([]TimeSeriesDataPoint, len(data))
	for i, val := range data {
		series[i] = TimeSeriesDataPoint{Date: time.Time{}, Value: val}
	}

	return &AnalysisResult{
		Type:        analysisType,
		Column:      columnName,
		Count:       count,
		Sum:         sum,
		Mean:        mean,
		StdDev:      stdDev,
		TotalReturn: 0,
		Series:      series,
		BalanceSeries: nil,
		FlowSummary:   CashFlowSummary{},
		Health:        FinancialHealth{},
	}
}