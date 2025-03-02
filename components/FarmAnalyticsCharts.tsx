import React, { useState } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { Surface, useTheme, Text } from "react-native-paper";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width * 0.75; // 75% of screen width to fit in message bubble
const CHART_HEIGHT = 180; // Reduced height
const BAR_CHART_WIDTH = CHART_WIDTH * 0.65; // Increased to 65% of chart width for bar chart
const PIE_CHART_WIDTH = CHART_WIDTH * 0.35; // Reduced to 35% of chart width for pie chart

export interface FarmAnalyticsData {
  tillageNames: string[];
  profits: number[];
  revenue: number[];
  projectedProfits: number[];
  breakEvenPoint: number;
}

interface TooltipData {
  x: number;
  y: number;
  index: number;
  value: number;
}

export const FarmAnalyticsCharts = ({ data }: { data: FarmAnalyticsData }) => {
  const theme = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);

  const chartColors = [
    "rgba(43, 63, 229, 0.8)",
    "rgba(250, 192, 19, 0.8)",
    "rgba(253, 135, 135, 0.8)",
  ];

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => chartColors[0],
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 2,
    barPercentage: 0.9,
    spacing: 0.05,
    barRadius: 0,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
    },
    propsForVerticalLabels: {
      fontSize: 12,
    },
    propsForHorizontalLabels: {
      fontSize: 12,
    },
    formatYLabel: (value: string) => `$${value}`,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.surface,
    },
  };

  const commonProps = {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    chartConfig: chartConfig,
    yAxisLabel: "$",
    yAxisSuffix: "",
    paddingLeft: "15",
    withInnerLines: false,
    withOuterLines: true,
    withVerticalLines: false,
    withHorizontalLines: true,
    withVerticalLabels: true,
    withHorizontalLabels: true,
    fromZero: true,
    onDataPointClick: ({ index, value, x, y }: any) => {
      const adjustedX = x - 40;
      const adjustedY = y - 60;
      setTooltipData({ index, value, x: adjustedX, y: adjustedY });
      setTimeout(() => setTooltipData(null), 2000);
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.rowContainer}>
        <Surface style={[styles.chartCard, styles.barChartCard]}>
          <Text style={styles.chartTitle}>Profit by Tillage Method</Text>
          <View style={styles.chartContainer}>
            <BarChart
              {...commonProps}
              width={BAR_CHART_WIDTH}
              data={{
                labels: data.tillageNames.map(
                  (name) => name.split(" ").pop() || name
                ),
                datasets: [
                  {
                    data: data.profits,
                    colors: chartColors.map((color) => () => color),
                  },
                ],
              }}
              height={CHART_HEIGHT}
              yAxisLabel="$"
              verticalLabelRotation={30}
              showValuesOnTopOfBars
              withCustomBarColorFromData
              flatColor
              fromZero
              segments={4}
              style={styles.chart}
            />
            <Text style={styles.xAxisLabel}>Tillage Method</Text>
            <Text style={styles.yAxisLabel}>Profit ($)</Text>
            {tooltipData && (
              <View
                style={[
                  styles.tooltip,
                  {
                    position: "absolute",
                    top: tooltipData.y,
                    left: tooltipData.x,
                  },
                ]}
              >
                <Text style={styles.tooltipText}>
                  {`${data.tillageNames[tooltipData.index]}\n$${
                    data.profits[tooltipData.index]
                  }`}
                </Text>
              </View>
            )}
          </View>
        </Surface>

        <Surface style={[styles.chartCard, styles.pieChartCard]}>
          <Text style={styles.chartTitle}>Profit Distribution</Text>
          <View style={styles.pieChartContainer}>
            <View style={styles.pieChartWrapper}>
              <PieChart
                {...commonProps}
                width={PIE_CHART_WIDTH}
                height={CHART_HEIGHT + 70}
                data={data.tillageNames.map((name, index) => ({
                  name: `${name.split(" ").pop() || name}`,
                  population: data.profits[index],
                  color: chartColors[index],
                }))}
                accessor="population"
                backgroundColor="transparent"
                absolute
                hasLegend={false}
                center={[PIE_CHART_WIDTH / 2.25, CHART_HEIGHT / 12.2]}
                paddingLeft="-75"
              />
              <View style={styles.pieLabels}>
                {data.tillageNames.map((name, index) => (
                  <Text
                    key={index}
                    style={[styles.pieLabel, { color: chartColors[index] }]}
                  >
                    {`${name.split(" ").pop() || name}: $${
                      data.profits[index]
                    }`}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </Surface>
      </View>

      <Surface style={styles.chartCard}>
        <Text style={styles.chartTitle}>Revenue vs Profit Over Time</Text>
        <View style={styles.chartContainer}>
          <LineChart
            {...commonProps}
            data={{
              labels: ["1", "2", "3"],
              datasets: [
                {
                  data: data.revenue,
                  color: (opacity = 1) => "rgba(6, 79, 240, 1)",
                  strokeWidth: 2,
                },
                {
                  data: data.profits,
                  color: (opacity = 1) => "rgba(255, 48, 48, 1)",
                  strokeWidth: 2,
                },
              ],
              legend: ["Revenue", "Profit"],
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.xAxisLabel}>Time Period</Text>
          <Text style={styles.yAxisLabel}>Amount ($)</Text>
          {tooltipData && (
            <View style={[styles.tooltip, { top: CHART_HEIGHT / 2 - 40 }]}>
              <Text style={styles.tooltipText}>
                {`Revenue: $${data.revenue[tooltipData.index]}\nProfit: $${
                  data.profits[tooltipData.index]
                }`}
              </Text>
            </View>
          )}
        </View>
      </Surface>

      <Surface style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          Projected Profits and Break-even Point
        </Text>
        <View style={styles.chartContainer}>
          <LineChart
            {...commonProps}
            data={{
              labels: ["1", "2", "3", "4", "5", "6"],
              datasets: [
                {
                  data: data.projectedProfits,
                  color: (opacity = 1) => "rgba(6, 79, 240, 1)",
                  strokeWidth: 2,
                },
                {
                  data: Array(6).fill(data.breakEvenPoint),
                  color: (opacity = 1) => "rgba(255, 48, 48, 1)",
                  strokeWidth: 2,
                  withDots: false,
                },
              ],
              legend: ["Expected Profit", "Break-even"],
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.xAxisLabel}>Time Period</Text>
          <Text style={styles.yAxisLabel}>Amount ($)</Text>
          {tooltipData && (
            <View style={[styles.tooltip, { top: CHART_HEIGHT / 2 - 40 }]}>
              <Text style={styles.tooltipText}>
                {`Expected: $${
                  data.projectedProfits[tooltipData.index]
                }\nBreak-even: $${data.breakEvenPoint}`}
              </Text>
            </View>
          )}
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    gap: 12,
  },
  chartCard: {
    borderRadius: 8,
    padding: 8,
    elevation: 2,
    marginVertical: 4,
  },
  chart: {
    marginVertical: 4,
    borderRadius: 8,
  },
  chartContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 35, // Add space for y-axis label
  },
  tooltip: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 8,
    borderRadius: 4,
    zIndex: 1000,
    minWidth: 80,
  },
  tooltipText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  xAxisLabel: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
  yAxisLabel: {
    position: "absolute",
    left: -35,
    top: CHART_HEIGHT / 2,
    transform: [{ rotate: "-90deg" }],
    fontSize: 12,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  barChartCard: {
    flex: 0.65,
  },
  pieChartCard: {
    flex: 0.35,
    minHeight: CHART_HEIGHT + 120,
  },
  pieChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 8,
    marginLeft: 0,
    marginTop: -40,
    overflow: "visible",
    minHeight: CHART_HEIGHT + 120,
  },
  pieChartWrapper: {
    position: "relative",
    alignItems: "center",
  },
  pieLabels: {
    position: "absolute",
    bottom: 0,
    right: 8,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 4,
    maxWidth: PIE_CHART_WIDTH,
  },
  pieLabel: {
    fontSize: 11,
    marginVertical: 2,
    textAlign: "right",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
