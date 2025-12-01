import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import type { BraceletItem } from "@/data/braceletData";
import { formatIndianCurrency } from "./utils";

interface ReportData {
  totalStockValue: number;
  totalItems: number;
  deadStockItems: BraceletItem[];
  deadStockValue: number;
  deadStockPercentage: string;
  fastMovingItems: BraceletItem[];
  fastMovingValue: number;
  fastMovingPercentage: string;
  slowMovingItems: BraceletItem[];
  slowMovingValue: number;
  avgDaysToSell: number;
  topPerforming: { type: string; count: number; value: number; avgVelocity: number };
  worstPerforming: { type: string; count: number; value: number; avgVelocity: number };
  fastMovingTopType: string;
  avgSalesVelocity: string;
  fastMovingAvgPrice: number;
  slowMovingAvgDays: number;
  slowMovingAvgPrice: number;
  deadStockAvgDays: number;
  deadStockAvgPrice: number;
  distributionByType: Array<{ type: string; count: number; value: number }>;
  distributionByMetal: Array<{ metal: string; count: number; value: number }>;
  distributionByDesignStyle: Array<{ style: string; count: number; value: number }>;
  distributionByLocation: Array<{ location: string; count: number; value: number }>;
}

export async function generateBraceletReport(data: ReportData) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "Bracelet Inventory Analysis Report",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            text: `Generated on ${new Date().toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "long", 
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
          }),

          // Executive Summary
          new Paragraph({
            text: "Executive Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `This comprehensive report analyzes ${data.totalItems} bracelet items in inventory with a total value of ${formatIndianCurrency(data.totalStockValue)}. `,
                bold: true,
              }),
              new TextRun({
                text: `The analysis provides AI-powered insights into inventory performance, identifies fast-moving products for restocking, and highlights items requiring liquidation.`,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Overall AI Prediction
          new Paragraph({
            text: "Overall AI Prediction",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "📊 Overall Performance",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Your bracelet inventory consists of ${data.totalItems} items valued at ${formatIndianCurrency(data.totalStockValue)}. `,
              }),
              new TextRun({
                text: `Fast-moving items account for ${data.fastMovingPercentage}% of inventory with an average sales velocity of ${data.avgSalesVelocity} units/month. `,
              }),
              new TextRun({
                text: `The average time items spend in inventory is ${data.avgDaysToSell} days.`,
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "⚠️ Dead Stock Alert",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${data.deadStockItems.length} items (${data.deadStockPercentage}%) are classified as dead stock, representing `,
              }),
              new TextRun({
                text: formatIndianCurrency(data.deadStockValue),
                bold: true,
              }),
              new TextRun({
                text: " in tied-up capital. These items have been in inventory for an average of ",
              }),
              new TextRun({
                text: `${data.deadStockAvgDays} days`,
                bold: true,
              }),
              new TextRun({
                text: " with zero sales activity.",
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "🏆 Top Performer Analysis",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${data.topPerforming.type} bracelets are your star performers with ${data.topPerforming.count} items generating strong sales at an average velocity of ${data.topPerforming.avgVelocity.toFixed(1)} units/month. `,
              }),
              new TextRun({
                text: `${data.worstPerforming.type} bracelets need strategic intervention with only ${data.worstPerforming.count} items showing minimal movement.`,
              }),
            ],
            spacing: { after: 300 },
          }),

          // Specific AI Insights
          new Paragraph({
            text: "Specific AI Insights",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            text: "Fast-Moving Goods Analysis",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `You have ${data.fastMovingItems.length} fast-moving bracelets valued at `,
              }),
              new TextRun({
                text: formatIndianCurrency(data.fastMovingValue),
                bold: true,
              }),
              new TextRun({
                text: `. These items are selling at ${data.avgSalesVelocity} units/month, indicating strong market demand. `,
              }),
              new TextRun({
                text: `${data.fastMovingTopType} bracelets are your top performers in this category.`,
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Fast-moving table
          ...createInventoryTable(data.fastMovingItems.slice(0, 10), "Top 10 Fast-Moving Items"),

          new Paragraph({
            text: "Slow-Moving Goods Analysis",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Your ${data.slowMovingItems.length} slow-moving bracelets (valued at `,
              }),
              new TextRun({
                text: formatIndianCurrency(data.slowMovingValue),
                bold: true,
              }),
              new TextRun({
                text: `) have been in inventory for an average of ${data.slowMovingAvgDays} days. Strategic intervention is needed to prevent them from becoming dead stock.`,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Slow-moving table
          ...createInventoryTable(data.slowMovingItems.slice(0, 10), "Top 10 Slow-Moving Items"),

          new Paragraph({
            text: "Dead Stock Analysis",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Your ${data.deadStockItems.length} dead stock items (valued at `,
              }),
              new TextRun({
                text: formatIndianCurrency(data.deadStockValue),
                bold: true,
              }),
              new TextRun({
                text: `) have been in inventory for an average of ${data.deadStockAvgDays} days with zero sales. `,
              }),
              new TextRun({
                text: "This represents significant tied-up capital that could be reinvested in fast-moving inventory.",
                bold: true,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Dead stock table
          ...createInventoryTable(data.deadStockItems.slice(0, 10), "Top 10 Dead Stock Items"),

          // Purchase Recommendations
          new Paragraph({
            text: "Purchase Recommendations - What to Buy Next",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Based on fast-moving goods analysis, the following purchase decisions are recommended to optimize inventory turnover and maximize profitability:",
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "1. Priority Restock - Bracelet Types: ",
                bold: true,
              }),
              new TextRun({
                text: `${data.topPerforming.type} bracelets should be your highest priority for restocking. With ${data.topPerforming.count} items showing strong sales velocity of ${data.topPerforming.avgVelocity.toFixed(1)} units/month, this type demonstrates consistent market demand. `,
              }),
              new TextRun({
                text: `Additionally, focus on ${data.fastMovingTopType} bracelets as they are your top performers in the fast-moving category.`,
                bold: true,
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "2. Recommended Chain/Bracelet Types to Purchase: ",
                bold: true,
              }),
              new TextRun({
                text: `Based on fast-moving analysis, prioritize purchasing ${data.topPerforming.type} and ${data.fastMovingTopType} bracelets. These types show the strongest sales performance and should be maintained at higher inventory levels.`,
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "3. Metal Preferences for New Purchases: ",
                bold: true,
              }),
              new TextRun({
                text: `Analyze the metal distribution of your fast-moving items. Focus on purchasing bracelets in metals that are performing well in your fast-moving inventory. `,
              }),
              new TextRun({
                text: `The average price point of fast-moving items is ${formatIndianCurrency(data.fastMovingAvgPrice)}, which can guide your purchasing budget allocation.`,
                bold: true,
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "4. Design Style Recommendations: ",
                bold: true,
              }),
              new TextRun({
                text: `Maintain inventory levels of design styles that match your fast-moving items to capitalize on current market trends. `,
              }),
              new TextRun({
                text: `Review the distribution by design style to identify which styles are driving sales and prioritize similar designs in new purchases.`,
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "5. Inventory Management Strategy: ",
                bold: true,
              }),
              new TextRun({
                text: `Maintain 2-3 months of inventory for fast-moving items based on current sales velocity of ${data.avgSalesVelocity} units/month. `,
              }),
              new TextRun({
                text: `Set reorder points at 30-40% stock levels to avoid stockouts while preventing overstocking. `,
              }),
              new TextRun({
                text: `Consider increasing inventory for ${data.topPerforming.type} bracelets by 20-30% to meet growing demand.`,
                bold: true,
              }),
            ],
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "6. Budget Allocation: ",
                bold: true,
              }),
              new TextRun({
                text: `With ${formatIndianCurrency(data.fastMovingValue)} in fast-moving inventory, allocate 60-70% of your purchasing budget to restocking these high-performing types. `,
              }),
              new TextRun({
                text: `The remaining budget should be used for testing new designs that align with fast-moving patterns.`,
              }),
            ],
            spacing: { after: 200 },
          }),

          // Distribution Analysis
          new Paragraph({
            text: "Inventory Distribution Analysis",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 200 },
          }),

          new Paragraph({
            text: "Distribution by Bracelet Type",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 150 },
          }),
          ...createDistributionTable(
            data.distributionByType.map(d => ({ name: d.type, count: d.count, value: d.value })),
            ["Type", "Count", "Value"]
          ),

          new Paragraph({
            text: "Distribution by Metal Type",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 150 },
          }),
          ...createDistributionTable(
            data.distributionByMetal.map(d => ({ name: d.metal, count: d.count, value: d.value })),
            ["Metal", "Count", "Value"]
          ),

          new Paragraph({
            text: "Distribution by Design Style",
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 150 },
          }),
          ...createDistributionTable(
            data.distributionByDesignStyle.map(d => ({ name: d.style, count: d.count, value: d.value })),
            ["Design Style", "Count", "Value"]
          ),

          // Liquidation Recommendations
          new Paragraph({
            text: "Liquidation Recommendations - What to Liquidate",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            text: "Based on deadstock and slow-moving goods analysis, the following liquidation actions are recommended:",
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Immediate Liquidation (Dead Stock)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Launch 'Final Clearance' event with 30-50% discounts - better to recover 50-70% quickly than hold indefinitely",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Offer bulk promotions ('Buy 2, Get 1 Free') to move multiple units per transaction",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Consider liquidation channels: outlet stores, online marketplaces, auction sites, or wholesale",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Bundle as 'free gifts' with fast-moving product purchases",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Financial Impact: Freeing up ${formatIndianCurrency(data.deadStockValue)} could be reinvested in approximately `,
              }),
              new TextRun({
                text: data.fastMovingAvgPrice > 0 
                  ? `${Math.round(data.deadStockValue / data.fastMovingAvgPrice)}`
                  : "0",
                bold: true,
              }),
              new TextRun({
                text: " fast-moving bracelets generating regular sales",
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: "Strategic Clearance (Slow-Moving)",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Implement 15-25% discounts for items approaching 90 days and create 'Featured Deals' sections",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Bundle with fast-moving items (e.g., 'Buy fast-moving, get 30% off slow-moving')",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Relocate to high-traffic areas and create eye-catching displays with signage",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• Launch targeted social media campaigns and seasonal promotions",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "• If unsold after 120 days, consider transferring to different locations or channels",
              }),
            ],
            spacing: { after: 200 },
          }),

          // Key Metrics Summary
          new Paragraph({
            text: "Key Metrics Summary",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          ...createMetricsTable(data),

          // Conclusion
          new Paragraph({
            text: "Conclusion",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This report provides comprehensive insights into your bracelet inventory performance. ",
              }),
              new TextRun({
                text: "Focus on restocking fast-moving items, particularly ",
              }),
              new TextRun({
                text: `${data.topPerforming.type} and ${data.fastMovingTopType}`,
                bold: true,
              }),
              new TextRun({
                text: " bracelets, while implementing aggressive clearance strategies for dead stock items. ",
              }),
              new TextRun({
                text: "By following these recommendations, you can optimize inventory turnover, free up capital, and improve overall profitability.",
                bold: true,
              }),
            ],
            spacing: { after: 300 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Bracelet_Inventory_Report_${new Date().toISOString().split("T")[0]}.docx`;
  saveAs(blob, fileName);
}

function createInventoryTable(items: BraceletItem[], title: string): Paragraph[] {
  if (items.length === 0) {
    return [
      new Paragraph({
        text: `${title}: No items available`,
        spacing: { after: 200 },
      }),
    ];
  }

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("SKU")], width: { size: 20, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Type")], width: { size: 15, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Metal")], width: { size: 15, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Price")], width: { size: 15, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Days")], width: { size: 10, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Location")], width: { size: 15, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Status")], width: { size: 10, type: WidthType.PERCENTAGE } }),
      ],
    }),
    ...items.map(
      (item) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.sku)] }),
            new TableCell({ children: [new Paragraph(item.type)] }),
            new TableCell({ children: [new Paragraph(`${item.metal} (${item.metalPurity})`)] }),
            new TableCell({ children: [new Paragraph(formatIndianCurrency(item.finalSellingPrice))] }),
            new TableCell({ children: [new Paragraph(item.daysInInventory.toString())] }),
            new TableCell({ children: [new Paragraph(item.stockLocation)] }),
            new TableCell({ children: [new Paragraph(item.lifecycleStage)] }),
          ],
        })
    ),
  ];

  return [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 150 },
    }),
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
    new Paragraph({
      spacing: { after: 300 },
    }),
  ];
}

function createDistributionTable(
  data: Array<{ name: string; count: number; value: number }>,
  headers: string[]
): (Paragraph | Table)[] {
  const tableRows = [
    new TableRow({
      children: headers.map(
        (header) =>
          new TableCell({
            children: [new Paragraph(header)],
            width: { size: 33.33, type: WidthType.PERCENTAGE },
          })
      ),
    }),
    ...data.map(
      (item) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.name)] }),
            new TableCell({ children: [new Paragraph(item.count.toString())] }),
            new TableCell({ children: [new Paragraph(formatIndianCurrency(item.value))] }),
          ],
        })
    ),
  ];

  return [
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
    new Paragraph({
      spacing: { after: 200 },
    }),
  ];
}

function createMetricsTable(data: ReportData): (Paragraph | Table)[] {
  const metrics = [
    ["Total Stock Value", formatIndianCurrency(data.totalStockValue)],
    ["Total Items", data.totalItems.toString()],
    ["Fast-Moving Items", `${data.fastMovingItems.length} (${data.fastMovingPercentage}%)`],
    ["Fast-Moving Value", formatIndianCurrency(data.fastMovingValue)],
    ["Slow-Moving Items", data.slowMovingItems.length.toString()],
    ["Slow-Moving Value", formatIndianCurrency(data.slowMovingValue)],
    ["Dead Stock Items", `${data.deadStockItems.length} (${data.deadStockPercentage}%)`],
    ["Dead Stock Value", formatIndianCurrency(data.deadStockValue)],
    ["Average Days in Inventory", `${data.avgDaysToSell} days`],
    ["Average Sales Velocity", `${data.avgSalesVelocity} units/month`],
    ["Top Performing Type", data.topPerforming.type],
    ["Worst Performing Type", data.worstPerforming.type],
  ];

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph("Metric")], width: { size: 50, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph("Value")], width: { size: 50, type: WidthType.PERCENTAGE } }),
      ],
    }),
    ...metrics.map(
      ([metric, value]) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(metric)] }),
            new TableCell({ children: [new Paragraph(value)] }),
          ],
        })
    ),
  ];

  return [
    new Table({
      rows: tableRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
    new Paragraph({
      spacing: { after: 300 },
    }),
  ];
}
