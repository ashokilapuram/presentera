import React from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

/**
 * Data table component for editing chart data
 */
const DataTable = ({ 
  labels, 
  series, 
  chartType,
  onLabelChange, 
  onValueChange, 
  onRemoveRow,
  onSeriesNameChange,
  onRemoveSeries,
  onAddSeries,
  onKeyDown
}) => {
  return (
    <div className="chart-data-table-wrapper">
      <table className="chart-data-table">
        <TableHeader
          series={series}
          onSeriesNameChange={onSeriesNameChange}
          onRemoveSeries={onRemoveSeries}
          onAddSeries={onAddSeries}
        />
        <tbody>
          {labels.map((label, rowIndex) => (
            <TableRow
              key={rowIndex}
              label={label}
              rowIndex={rowIndex}
              series={series}
              chartType={chartType}
              onLabelChange={onLabelChange}
              onValueChange={onValueChange}
              onRemoveRow={onRemoveRow}
              onKeyDown={onKeyDown}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

