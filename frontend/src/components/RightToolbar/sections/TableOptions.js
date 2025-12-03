import React, { useState, useRef, useEffect } from 'react';
import LayerActions from '../shared/LayerActions';
import ModernColorPicker from '../shared/ModernColorPicker';
import FontFamilyDropdown from '../../Toolbar/components/FontFamilyDropdown';
import { FiAlignLeft, FiAlignCenter, FiAlignRight, FiBold, FiItalic, FiUnderline } from 'react-icons/fi';
import { Palette } from 'lucide-react';

const TableOptions = ({
  selectedElement,
  updateSlideElement,
  bringForward,
  bringToFront,
  sendBackward,
  sendToBack,
  updateSlide,
  currentSlide,
  deleteElement
}) => {
  // Get current cell data or default (using first cell as reference)
  const getCellData = (row = 0, col = 0) => {
    if (!selectedElement.data || !selectedElement.data[row] || !selectedElement.data[row][col]) {
      return {
        text: "",
        bgColor: "#ffffff",
        textColor: "#000000",
        borderColor: "#cccccc",
        borderWidth: 1,
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        align: "left"
      };
    }
    return selectedElement.data[row][col];
  };

  // Table style definitions
  const getTableStyles = () => ({
    orange: {
      header: { bgColor: "#FF6B35", textColor: "#ffffff", borderColor: "#FFFFFF", fontWeight: "bold" },
      row1: { bgColor: "#FFE5D9", textColor: "#000000", borderColor: "#FFFFFF" },
      row2: { bgColor: "#FFF0E6", textColor: "#000000", borderColor: "#FFFFFF" },
      row3: { bgColor: "#FFE5D9", textColor: "#000000", borderColor: "#FFFFFF" }
    },
    grey: {
      header: { bgColor: "#6C757D", textColor: "#ffffff", borderColor: "#FFFFFF", fontWeight: "bold" },
      row1: { bgColor: "#E9ECEF", textColor: "#000000", borderColor: "#FFFFFF" },
      row2: { bgColor: "#F5F6F7", textColor: "#000000", borderColor: "#FFFFFF" },
      row3: { bgColor: "#E9ECEF", textColor: "#000000", borderColor: "#FFFFFF" }
    },
    yellow: {
      header: { bgColor: "#FFC000", textColor: "#000000", borderColor: "#FFFFFF", fontWeight: "bold" },
      row1: { bgColor: "#FFF2CC", textColor: "#000000", borderColor: "#FFFFFF" },
      row2: { bgColor: "#FFF9E6", textColor: "#000000", borderColor: "#FFFFFF" },
      row3: { bgColor: "#FFF2CC", textColor: "#000000", borderColor: "#FFFFFF" }
    },
    blue: {
      header: { bgColor: "#2196F3", textColor: "#ffffff", borderColor: "#FFFFFF", fontWeight: "bold" },
      row1: { bgColor: "#BBDEFB", textColor: "#000000", borderColor: "#FFFFFF" },
      row2: { bgColor: "#E3F2FD", textColor: "#000000", borderColor: "#FFFFFF" },
      row3: { bgColor: "#BBDEFB", textColor: "#000000", borderColor: "#FFFFFF" }
    }
  });

  // Check if colors match a table style pattern
  const checkIfStyleMatches = (rowIndex, cell, styleName) => {
    const styles = getTableStyles();
    const style = styles[styleName];
    if (!style) return false;

    let expectedStyle;
    if (rowIndex === 0) {
      expectedStyle = style.header;
    } else if (rowIndex === 1) {
      expectedStyle = style.row1;
    } else if (rowIndex === 2) {
      expectedStyle = style.row2;
    } else {
      expectedStyle = (rowIndex % 2 === 1) ? style.row1 : style.row2;
    }

    return cell.bgColor === expectedStyle.bgColor &&
           cell.textColor === expectedStyle.textColor &&
           cell.borderColor === expectedStyle.borderColor;
  };

  // Update all cells (formatting applies to entire table)
  const updateAllCells = (updates) => {
    if (!selectedElement.data) return;
    const newData = selectedElement.data.map(row =>
      row.map(cell => ({ ...cell, ...updates }))
    );
    
    // If color is being changed manually, check if it breaks the style pattern
    if (updates.bgColor || updates.textColor || updates.borderColor) {
      const currentStyle = selectedElement.tableStyle;
      if (currentStyle) {
        // Check if any cell doesn't match the style pattern
        const styleBroken = newData.some((row, rowIndex) =>
          row.some(cell => !checkIfStyleMatches(rowIndex, cell, currentStyle))
        );
        if (styleBroken) {
          // Remove style reference if pattern is broken
          updateSlideElement(selectedElement.id, { data: newData, tableStyle: undefined });
          return;
        }
      }
    }
    
    updateSlideElement(selectedElement.id, { data: newData });
  };

  // Update only header cells (first row)
  const updateHeaderCells = (updates) => {
    if (!selectedElement.data || selectedElement.data.length === 0) return;
    const newData = selectedElement.data.map((row, rowIndex) => {
      if (rowIndex === 0) {
        // First row - update all cells in header
        return row.map(cell => ({ ...cell, ...updates }));
      }
      return row;
    });
    
    // If color is being changed manually, check if it breaks the style pattern
    if (updates.bgColor || updates.textColor || updates.borderColor) {
      const currentStyle = selectedElement.tableStyle;
      if (currentStyle) {
        // Check if header row doesn't match the style pattern
        const styleBroken = newData[0].some(cell => !checkIfStyleMatches(0, cell, currentStyle));
        if (styleBroken) {
          // Remove style reference if pattern is broken
          updateSlideElement(selectedElement.id, { data: newData, tableStyle: undefined });
          return;
        }
      }
    }
    
    updateSlideElement(selectedElement.id, { data: newData });
  };

  // Update only data cells (excludes header row - first row)
  const updateDataCells = (updates) => {
    if (!selectedElement.data || selectedElement.data.length === 0) return;
    const newData = selectedElement.data.map((row, rowIndex) => {
      if (rowIndex === 0) {
        // Skip header row (first row) - return as is
        return row;
      }
      // Update all data rows (non-header rows)
      return row.map(cell => ({ ...cell, ...updates }));
    });
    
    // If color is being changed manually, check if it breaks the style pattern
    if (updates.bgColor || updates.textColor || updates.borderColor) {
      const currentStyle = selectedElement.tableStyle;
      if (currentStyle) {
        // Check if any data row doesn't match the style pattern
        const styleBroken = newData.some((row, rowIndex) => {
          if (rowIndex === 0) return false; // Skip header
          return row.some(cell => !checkIfStyleMatches(rowIndex, cell, currentStyle));
        });
        if (styleBroken) {
          // Remove style reference if pattern is broken
          updateSlideElement(selectedElement.id, { data: newData, tableStyle: undefined });
          return;
        }
      }
    }
    
    updateSlideElement(selectedElement.id, { data: newData });
  };

  // Add row
  const addRow = () => {
    const cols = selectedElement.cols || 4;
    const data = selectedElement.data || [];
    const currentStyle = selectedElement.tableStyle;
    const styles = getTableStyles();
    
    // Determine the color pattern for the new row
    let newRowStyle;
    const newRowIndex = data.length; // Index of the new row (0-based)
    
    if (currentStyle && styles[currentStyle]) {
      // Use table style pattern
      const style = styles[currentStyle];
      let cellStyle;
      if (newRowIndex === 0) {
        cellStyle = style.header;
      } else if (newRowIndex === 1) {
        cellStyle = style.row1;
      } else if (newRowIndex === 2) {
        cellStyle = style.row2;
      } else {
        // For rows beyond 2, alternate between row1 and row2
        cellStyle = (newRowIndex % 2 === 1) ? style.row1 : style.row2;
      }
      
      newRowStyle = {
        text: "",
        bgColor: cellStyle.bgColor,
        textColor: cellStyle.textColor,
        borderColor: cellStyle.borderColor,
        borderWidth: 2,
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: newRowIndex === 0 ? (cellStyle.fontWeight || "bold") : "normal",
        fontStyle: "normal",
        textDecoration: "none",
        align: "left"
      };
    } else if (data.length === 0) {
      // No existing data, use default
      newRowStyle = {
        text: "",
        bgColor: "#ffffff",
        textColor: "#000000",
        borderColor: "#cccccc",
        borderWidth: 1,
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        align: "left"
      };
    } else {
      // Get the last row's style
      const lastRow = data[data.length - 1];
      const lastCellStyle = lastRow && lastRow[0] ? lastRow[0] : null;
      
      if (lastCellStyle) {
        // Check if last row is white (for alternating pattern)
        const isLastRowWhite = lastCellStyle.bgColor === "#ffffff" || 
                              lastCellStyle.bgColor.toLowerCase() === "#ffffff" ||
                              lastCellStyle.bgColor === "#FFFFFF";
        
        if (isLastRowWhite) {
          // Last row is white, find the most recent colored row to copy its style
          let coloredRowStyle = null;
          for (let i = data.length - 2; i >= 0; i--) {
            const row = data[i];
            const cellStyle = row && row[0] ? row[0] : null;
            if (cellStyle) {
              const isWhite = cellStyle.bgColor === "#ffffff" || 
                             cellStyle.bgColor.toLowerCase() === "#ffffff" ||
                             cellStyle.bgColor === "#FFFFFF";
              if (!isWhite) {
                coloredRowStyle = cellStyle;
                break;
              }
            }
          }
          
          // Use the colored style if found, otherwise use a default colored style
          if (coloredRowStyle) {
            newRowStyle = {
              ...coloredRowStyle,
              text: "",
              fontWeight: "normal" // Data rows shouldn't be bold (only header)
            };
          } else {
            // No colored row found, use a light gray as default
            newRowStyle = {
              ...lastCellStyle,
              text: "",
              bgColor: "#f0f0f0",
              fontWeight: "normal"
            };
          }
        } else {
          // Last row is colored, use white for the new row
          newRowStyle = {
            ...lastCellStyle,
            text: "",
            bgColor: "#ffffff",
            fontWeight: "normal"
          };
        }
      } else {
        // Fallback to default
        newRowStyle = {
          text: "",
          bgColor: "#ffffff",
          textColor: "#000000",
          borderColor: "#cccccc",
          borderWidth: 1,
          fontSize: 14,
          fontFamily: "Arial",
          fontWeight: "normal",
          fontStyle: "normal",
          textDecoration: "none",
          align: "left"
        };
      }
    }
    
    const newRow = Array(cols).fill(null).map(() => ({ ...newRowStyle }));
    const newData = [...data, newRow];
    const newRows = (selectedElement.rows || 3) + 1;
    const newHeight = selectedElement.height + (selectedElement.cellHeight || 40);
    updateSlideElement(selectedElement.id, {
      data: newData,
      rows: newRows,
      height: newHeight
    });
  };

  // Delete row
  const deleteRow = () => {
    if (selectedElement.data.length <= 1) return;
    const newData = selectedElement.data.slice(0, -1);
    const newRows = (selectedElement.rows || 3) - 1;
    const newHeight = Math.max(50, selectedElement.height - (selectedElement.cellHeight || 40));
    updateSlideElement(selectedElement.id, {
      data: newData,
      rows: newRows,
      height: newHeight
    });
  };

  // Add column
  const addColumn = () => {
    const data = selectedElement.data || [];
    const newData = data.map((row, rowIndex) => {
      // Copy the style from the last cell in the row to maintain consistency
      const lastCell = row && row.length > 0 ? row[row.length - 1] : null;
      const newCell = lastCell ? {
        ...lastCell,
        text: ""
      } : {
        text: "",
        bgColor: "#ffffff",
        textColor: "#000000",
        borderColor: "#cccccc",
        borderWidth: 1,
        fontSize: 14,
        fontFamily: "Arial",
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        align: "left"
      };
      return [...row, newCell];
    });
    const newCols = (selectedElement.cols || 4) + 1;
    const newWidth = selectedElement.width + (selectedElement.cellWidth || 100);
    updateSlideElement(selectedElement.id, {
      data: newData,
      cols: newCols,
      width: newWidth
    });
  };

  // Delete column
  const deleteColumn = () => {
    if ((selectedElement.cols || 4) <= 1) return;
    const newData = selectedElement.data.map(row => row.slice(0, -1));
    const newCols = (selectedElement.cols || 4) - 1;
    const newWidth = Math.max(100, selectedElement.width - (selectedElement.cellWidth || 100));
    updateSlideElement(selectedElement.id, {
      data: newData,
      cols: newCols,
      width: newWidth
    });
  };

  // Update rows count
  const updateRows = (newRowCount) => {
    const currentRows = selectedElement.rows || selectedElement.data?.length || 4;
    const cols = selectedElement.cols || 4;
    const data = selectedElement.data || [];
    const cellHeight = selectedElement.cellHeight || 40;
    const currentStyle = selectedElement.tableStyle;
    const styles = getTableStyles();
    
    let newData = [...data];
    
    if (newRowCount > currentRows) {
      // Add rows
      for (let i = currentRows; i < newRowCount; i++) {
        // Determine the color pattern for the new row
        let newRowStyle;
        const newRowIndex = i; // Index of the new row (0-based)
        
        if (currentStyle && styles[currentStyle]) {
          // Use table style pattern
          const style = styles[currentStyle];
          let cellStyle;
          if (newRowIndex === 0) {
            cellStyle = style.header;
          } else if (newRowIndex === 1) {
            cellStyle = style.row1;
          } else if (newRowIndex === 2) {
            cellStyle = style.row2;
          } else {
            // For rows beyond 2, alternate between row1 and row2
            cellStyle = (newRowIndex % 2 === 1) ? style.row1 : style.row2;
          }
          
          newRowStyle = {
            text: "",
            bgColor: cellStyle.bgColor,
            textColor: cellStyle.textColor,
            borderColor: cellStyle.borderColor,
            borderWidth: 2,
            fontSize: 14,
            fontFamily: "Arial",
            fontWeight: newRowIndex === 0 ? (cellStyle.fontWeight || "bold") : "normal",
            fontStyle: "normal",
            textDecoration: "none",
            align: "left"
          };
        } else if (newData.length === 0) {
          newRowStyle = {
            text: "",
            bgColor: "#ffffff",
            textColor: "#000000",
            borderColor: "#cccccc",
            borderWidth: 1,
            fontSize: 14,
            fontFamily: "Arial",
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "none",
            align: "left"
          };
        } else {
          const lastRow = newData[newData.length - 1];
          const lastCellStyle = lastRow && lastRow[0] ? lastRow[0] : null;
          
          if (lastCellStyle) {
            const isLastRowWhite = lastCellStyle.bgColor === "#ffffff" || 
                                  lastCellStyle.bgColor.toLowerCase() === "#ffffff" ||
                                  lastCellStyle.bgColor === "#FFFFFF";
            
            if (isLastRowWhite) {
              // Find most recent colored row
              let coloredRowStyle = null;
              for (let j = newData.length - 2; j >= 0; j--) {
                const row = newData[j];
                const cellStyle = row && row[0] ? row[0] : null;
                if (cellStyle) {
                  const isWhite = cellStyle.bgColor === "#ffffff" || 
                                 cellStyle.bgColor.toLowerCase() === "#ffffff" ||
                                 cellStyle.bgColor === "#FFFFFF";
                  if (!isWhite) {
                    coloredRowStyle = cellStyle;
                    break;
                  }
                }
              }
              
              if (coloredRowStyle) {
                newRowStyle = { ...coloredRowStyle, text: "", fontWeight: "normal" };
              } else {
                newRowStyle = { ...lastCellStyle, text: "", bgColor: "#f0f0f0", fontWeight: "normal" };
              }
            } else {
              newRowStyle = { ...lastCellStyle, text: "", bgColor: "#ffffff", fontWeight: "normal" };
            }
          } else {
            newRowStyle = {
              text: "",
              bgColor: "#ffffff",
              textColor: "#000000",
              borderColor: "#cccccc",
              borderWidth: 1,
              fontSize: 14,
              fontFamily: "Arial",
              fontWeight: "normal",
              fontStyle: "normal",
              textDecoration: "none",
              align: "left"
            };
          }
        }
        
        const newRow = Array(cols).fill(null).map(() => ({ ...newRowStyle }));
        newData.push(newRow);
      }
    } else if (newRowCount < currentRows) {
      // Remove rows (keep at least 1 row)
      newData = newData.slice(0, Math.max(1, newRowCount));
    }
    
    const newHeight = newRowCount * cellHeight;
    updateSlideElement(selectedElement.id, {
      data: newData,
      rows: newRowCount,
      height: newHeight
    });
  };

  // Update columns count
  const updateColumns = (newColCount) => {
    const currentCols = selectedElement.cols || 4;
    const data = selectedElement.data || [];
    const cellWidth = selectedElement.cellWidth || 100;
    
    let newData = data.map(row => {
      if (newColCount > currentCols) {
        // Add columns
        const lastCell = row && row.length > 0 ? row[row.length - 1] : null;
        const newCell = lastCell ? { ...lastCell, text: "" } : {
          text: "",
          bgColor: "#ffffff",
          textColor: "#000000",
          borderColor: "#cccccc",
          borderWidth: 1,
          fontSize: 14,
          fontFamily: "Arial",
          fontWeight: "normal",
          fontStyle: "normal",
          textDecoration: "none",
          align: "left"
        };
        const newCells = Array(newColCount - currentCols).fill(null).map(() => ({ ...newCell }));
        return [...row, ...newCells];
      } else if (newColCount < currentCols) {
        // Remove columns (keep at least 1 column)
        return row.slice(0, Math.max(1, newColCount));
      }
      return row;
    });
    
    const newWidth = newColCount * cellWidth;
    updateSlideElement(selectedElement.id, {
      data: newData,
      cols: newColCount,
      width: newWidth
    });
  };

  // Get current cell data for formatting (using first data row, first cell as reference)
  const currentCell = getCellData(1, 0); // Use first data row, not header
  
  // Get header cell data (first row, first cell as reference)
  const headerCell = getCellData(0, 0);

  // Tab state for Header/Cell styling
  const [activeTab, setActiveTab] = useState('header');

  // Dropdown state for font family
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Refs for color picker buttons
  const headerTextColorButtonRef = useRef(null);
  const headerBgColorButtonRef = useRef(null);
  const cellTextColorButtonRef = useRef(null);
  const cellBgColorButtonRef = useRef(null);
  const borderColorButtonRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.dropdown-trigger')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Dropdown handlers
  const openDropdown = (e, type) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width
    });
    setActiveDropdown(type);
  };

  return (
    <div className="right-toolbar-section">
      {/* Table Structure Container */}
      <div className="option-group table-structure-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        padding: '0.75rem'
      }}>
        <div className="table-structure-label" style={{
          fontSize: '0.875rem',
          fontWeight: '600',
          color: '#404040',
          marginBottom: '0.25rem'
        }}>
          Table Structure
        </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {/* Rows and Columns Input */}
            <div className="table-rows-columns-options-container" style={{
              padding: '0.375rem',
              background: '#f3f4f6',
              borderRadius: '0.5rem',
              border: 'none'
            }}>
              <div className="table-header-second-row" style={{ height: '28px', alignItems: 'center' }}>
                <label className="table-rows-label" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', marginRight: '4px' }}>Rows :</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={selectedElement.rows || selectedElement.data?.length || 4}
                  onChange={(e) => {
                    const newRows = Math.max(1, parseInt(e.target.value) || 1);
                    updateRows(newRows);
                  }}
                  className="toolbar-input table-structure-input"
                  style={{ width: '60px', height: '28px', marginRight: '12px' }}
                />
                <label className="table-columns-label" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', marginRight: '4px' }}>Columns :</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={selectedElement.cols || 4}
                  onChange={(e) => {
                    const newCols = Math.max(1, parseInt(e.target.value) || 1);
                    updateColumns(newCols);
                  }}
                  className="toolbar-input table-structure-input"
                  style={{ width: '60px', height: '28px' }}
                />
              </div>
            </div>
          
          {/* Border Width and Border Color */}
          <div className="table-border-options-container" style={{
            padding: '0.375rem',
            background: '#f3f4f6',
            borderRadius: '0.5rem',
            border: 'none'
          }}>
            <div className="table-header-second-row" style={{ height: '28px', alignItems: 'center' }}>
              <label className="table-border-label" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', marginRight: '4px' }}>Border :</label>
              <label className="table-border-width-label" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', marginRight: '4px' }}>width</label>
              <input
                type="number"
                min="0"
                max="10"
                value={currentCell.borderWidth || 1}
                onChange={(e) => {
                  const borderWidth = Math.max(0, parseInt(e.target.value) || 1);
                  updateAllCells({ borderWidth });
                }}
                className="toolbar-input table-border-input"
                placeholder="Size"
              />
              <label className="table-border-color-label" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', marginRight: '4px', marginLeft: '8px' }}>color</label>
              <div className="table-header-color-icon" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                  <ModernColorPicker
                    value={currentCell.borderColor || "#cccccc"}
                    onColorSelect={(color) => {
                      updateAllCells({ borderColor: color });
                    }}
                    defaultColor="#cccccc"
                    compact={true}
                    quickColors={[]}
                    buttonSize="0px"
                    buttonStyle={{
                      display: 'none',
                      opacity: 0,
                      position: 'absolute',
                      pointerEvents: 'none',
                      width: 0,
                      height: 0
                    }}
                  />
                </div>
                <div 
                  ref={borderColorButtonRef}
                  className="table-header-bg-color-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                    if (mcpButton) {
                      if (borderColorButtonRef.current) {
                        const rect = borderColorButtonRef.current.getBoundingClientRect();
                        mcpButton.setAttribute('data-actual-left', rect.left.toString());
                        mcpButton.setAttribute('data-actual-top', rect.top.toString());
                        mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                        mcpButton.setAttribute('data-actual-width', rect.width.toString());
                      }
                      mcpButton.click();
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <Palette size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header/Cell Styling Container */}
      <div className="option-group table-styling-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem',
        padding: '0.75rem'
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '0.25rem'
        }}>
          <button
            onClick={() => setActiveTab('header')}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: 'none',
              color: activeTab === 'header' ? '#000000' : '#6b7280',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'header' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === 'header' ? '2px solid #000000' : '2px solid transparent',
              marginBottom: '-1px'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'header') {
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'header') {
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            Header Styling
          </button>
          <button
            onClick={() => setActiveTab('cell')}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              background: 'transparent',
              border: 'none',
              color: activeTab === 'cell' ? '#000000' : '#6b7280',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'cell' ? '600' : '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              borderBottom: activeTab === 'cell' ? '2px solid #000000' : '2px solid transparent',
              marginBottom: '-1px'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'cell') {
                e.currentTarget.style.color = '#374151';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'cell') {
                e.currentTarget.style.color = '#6b7280';
              }
            }}
          >
            Cell Styling
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'header' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* First Row: 6 icons side by side (Bold, Italic, Underline, Align Left, Center, Right) */}
              <div className="table-icons-row-container" style={{
                padding: '0.5rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                border: 'none'
              }}>
                <div className="table-header-icons-row">
                <div
              onClick={() => {
                const newWeight = headerCell.fontWeight === 'bold' ? 'normal' : 'bold';
                updateHeaderCells({ fontWeight: newWeight });
              }}
                  className={`table-header-icon-btn ${headerCell.fontWeight === 'bold' ? 'active' : ''}`}
              title="Bold"
            >
                  <FiBold size={18} />
                </div>
                <div
              onClick={() => {
                const newStyle = headerCell.fontStyle === 'italic' ? 'normal' : 'italic';
                updateHeaderCells({ fontStyle: newStyle });
              }}
                  className={`table-header-icon-btn ${headerCell.fontStyle === 'italic' ? 'active' : ''}`}
              title="Italic"
            >
                  <FiItalic size={18} />
                </div>
                <div
              onClick={() => {
                const newDecoration = headerCell.textDecoration === 'underline' ? 'none' : 'underline';
                updateHeaderCells({ textDecoration: newDecoration });
              }}
                  className={`table-header-icon-btn ${headerCell.textDecoration === 'underline' ? 'active' : ''}`}
              title="Underline"
            >
                  <FiUnderline size={18} />
          </div>
                <div
              onClick={() => {
                updateHeaderCells({ align: 'left' });
              }}
                  className={`table-header-icon-btn ${headerCell.align === 'left' ? 'active' : ''}`}
              title="Align Left"
            >
                  <FiAlignLeft size={18} />
                </div>
                <div
              onClick={() => {
                updateHeaderCells({ align: 'center' });
              }}
                  className={`table-header-icon-btn ${headerCell.align === 'center' ? 'active' : ''}`}
              title="Align Center"
            >
                  <FiAlignCenter size={18} />
                </div>
                <div
              onClick={() => {
                updateHeaderCells({ align: 'right' });
              }}
                  className={`table-header-icon-btn ${headerCell.align === 'right' ? 'active' : ''}`}
              title="Align Right"
            >
                  <FiAlignRight size={18} />
          </div>
                </div>
              </div>

              {/* Second Row: Font Style, Font Size, Text Color, Background Color - Single Row */}
              <div style={{
                padding: '0.375rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                border: 'none'
              }}>
                <div className="table-header-second-row" style={{ height: '28px', alignItems: 'center' }}>
                {/* Font Family Dropdown */}
                <div className="table-font-family-dropdown-wrapper">
                  <FontFamilyDropdown
                    selectedElement={{ fontFamily: headerCell.fontFamily || "Arial" }}
                    textFormatting={{ fontFamily: headerCell.fontFamily || "Arial" }}
                    onOpenDropdown={openDropdown}
                    activeDropdown={activeDropdown}
                    dropdownPos={dropdownPos}
                    onApplyFormat={(property, value) => {
                      updateHeaderCells({ fontFamily: value });
                      setActiveDropdown(null);
                    }}
                  />
                </div>

                {/* Text Color Button */}
                <div className="table-header-font-color-btn" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <ModernColorPicker
                      value={headerCell.textColor || "#000000"}
                      onColorSelect={(color) => {
                        updateHeaderCells({ textColor: color });
                      }}
                      defaultColor="#000000"
                      compact={true}
                      quickColors={[]}
                      buttonSize="0px"
                      buttonStyle={{
                        display: 'none',
                        opacity: 0,
                        position: 'absolute',
                        pointerEvents: 'none',
                        width: 0,
                        height: 0
                      }}
                    />
                  </div>
                  <button
                    ref={headerTextColorButtonRef}
                    className="table-header-font-color-btn-inner"
                    onClick={(e) => {
                      e.stopPropagation();
                      const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                      if (mcpButton) {
                        if (headerTextColorButtonRef.current) {
                          const rect = headerTextColorButtonRef.current.getBoundingClientRect();
                          mcpButton.setAttribute('data-actual-left', rect.left.toString());
                          mcpButton.setAttribute('data-actual-top', rect.top.toString());
                          mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                          mcpButton.setAttribute('data-actual-width', rect.width.toString());
                        }
                        mcpButton.click();
                      }
                    }}
                  >
                    <span className="table-header-font-color-btn__label">A</span>
                    <span 
                      className="table-header-font-color-btn__swatch"
                      style={{
                        background: headerCell.textColor || "#000000"
                      }}
                    ></span>
                  </button>
                </div>

                {/* Font Size (reduced width) */}
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={headerCell.fontSize || 14}
                  onChange={(e) => {
                    const fontSize = parseInt(e.target.value) || 14;
                    updateHeaderCells({ fontSize });
                  }}
                  className="toolbar-input table-fontsize-input"
                  placeholder="Size"
                />

                {/* Background Color Icon */}
                <div className="table-header-color-icon" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <ModernColorPicker
                      value={headerCell.bgColor || "#ffffff"}
                      onColorSelect={(color) => {
                        updateHeaderCells({ bgColor: color });
                      }}
                      defaultColor="#ffffff"
                      compact={true}
                      quickColors={[]}
                      buttonSize="0px"
                      buttonStyle={{
                        display: 'none',
                        opacity: 0,
                        position: 'absolute',
                        pointerEvents: 'none',
                        width: 0,
                        height: 0
                      }}
                    />
                  </div>
                  <div 
                    ref={headerBgColorButtonRef}
                    className="table-header-bg-color-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                      if (mcpButton) {
                        if (headerBgColorButtonRef.current) {
                          const rect = headerBgColorButtonRef.current.getBoundingClientRect();
                          mcpButton.setAttribute('data-actual-left', rect.left.toString());
                          mcpButton.setAttribute('data-actual-top', rect.top.toString());
                          mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                          mcpButton.setAttribute('data-actual-width', rect.width.toString());
                        }
                        mcpButton.click();
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Palette size={16} />
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cell' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* First Row: 6 icons side by side (Bold, Italic, Underline, Align Left, Center, Right) */}
              <div className="table-icons-row-container" style={{
                padding: '0.5rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                border: 'none'
              }}>
                <div className="table-header-icons-row">
                <div
              onClick={() => {
                const newWeight = currentCell.fontWeight === 'bold' ? 'normal' : 'bold';
                updateDataCells({ fontWeight: newWeight });
              }}
                  className={`table-header-icon-btn ${currentCell.fontWeight === 'bold' ? 'active' : ''}`}
              title="Bold"
            >
                  <FiBold size={18} />
                </div>
                <div
              onClick={() => {
                const newStyle = currentCell.fontStyle === 'italic' ? 'normal' : 'italic';
                updateDataCells({ fontStyle: newStyle });
              }}
                  className={`table-header-icon-btn ${currentCell.fontStyle === 'italic' ? 'active' : ''}`}
              title="Italic"
            >
                  <FiItalic size={18} />
                </div>
                <div
              onClick={() => {
                const newDecoration = currentCell.textDecoration === 'underline' ? 'none' : 'underline';
                updateDataCells({ textDecoration: newDecoration });
              }}
                  className={`table-header-icon-btn ${currentCell.textDecoration === 'underline' ? 'active' : ''}`}
              title="Underline"
            >
                  <FiUnderline size={18} />
          </div>
                <div
              onClick={() => {
                updateDataCells({ align: 'left' });
              }}
                  className={`table-header-icon-btn ${currentCell.align === 'left' ? 'active' : ''}`}
              title="Align Left"
            >
                  <FiAlignLeft size={18} />
                </div>
                <div
              onClick={() => {
                updateDataCells({ align: 'center' });
              }}
                  className={`table-header-icon-btn ${currentCell.align === 'center' ? 'active' : ''}`}
              title="Align Center"
            >
                  <FiAlignCenter size={18} />
                </div>
                <div
              onClick={() => {
                updateDataCells({ align: 'right' });
              }}
                  className={`table-header-icon-btn ${currentCell.align === 'right' ? 'active' : ''}`}
              title="Align Right"
            >
                  <FiAlignRight size={18} />
                </div>
                </div>
              </div>

              {/* Second Row: Font Style, Font Size, Text Color, Background Color - Single Row */}
              <div style={{
                padding: '0.375rem',
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                border: 'none'
              }}>
                <div className="table-header-second-row" style={{ height: '28px', alignItems: 'center' }}>
                {/* Font Family Dropdown */}
                <div className="table-font-family-dropdown-wrapper">
                  <FontFamilyDropdown
                    selectedElement={{ fontFamily: currentCell.fontFamily || "Arial" }}
                    textFormatting={{ fontFamily: currentCell.fontFamily || "Arial" }}
                    onOpenDropdown={openDropdown}
                    activeDropdown={activeDropdown}
                    dropdownPos={dropdownPos}
                    onApplyFormat={(property, value) => {
                      updateDataCells({ fontFamily: value });
                      setActiveDropdown(null);
                    }}
                  />
                </div>

                {/* Text Color Button */}
                <div className="table-header-font-color-btn" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <ModernColorPicker
                      value={currentCell.textColor || "#000000"}
                      onColorSelect={(color) => {
                        updateDataCells({ textColor: color });
                      }}
                      defaultColor="#000000"
                      compact={true}
                      quickColors={[]}
                      buttonSize="0px"
                      buttonStyle={{
                        display: 'none',
                        opacity: 0,
                        position: 'absolute',
                        pointerEvents: 'none',
                        width: 0,
                        height: 0
                      }}
                    />
                  </div>
                  <button
                    ref={cellTextColorButtonRef}
                    className="table-header-font-color-btn-inner"
                    onClick={(e) => {
                      e.stopPropagation();
                      const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                      if (mcpButton) {
                        if (cellTextColorButtonRef.current) {
                          const rect = cellTextColorButtonRef.current.getBoundingClientRect();
                          mcpButton.setAttribute('data-actual-left', rect.left.toString());
                          mcpButton.setAttribute('data-actual-top', rect.top.toString());
                          mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                          mcpButton.setAttribute('data-actual-width', rect.width.toString());
                        }
                        mcpButton.click();
                      }
                    }}
                  >
                    <span className="table-header-font-color-btn__label">A</span>
                    <span 
                      className="table-header-font-color-btn__swatch"
                      style={{
                        background: currentCell.textColor || "#000000"
                      }}
                    ></span>
            </button>
          </div>

                {/* Font Size (reduced width) */}
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={currentCell.fontSize || 14}
                  onChange={(e) => {
                    const fontSize = parseInt(e.target.value) || 14;
                    updateDataCells({ fontSize });
                  }}
                  className="toolbar-input table-fontsize-input"
                  placeholder="Size"
                />

                {/* Background Color Icon */}
                <div className="table-header-color-icon" style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                    <ModernColorPicker
                      value={currentCell.bgColor || "#ffffff"}
                      onColorSelect={(color) => {
                        updateDataCells({ bgColor: color });
                      }}
                      defaultColor="#ffffff"
                      compact={true}
                      quickColors={[]}
                      buttonSize="0px"
                      buttonStyle={{
                        display: 'none',
                        opacity: 0,
                        position: 'absolute',
                        pointerEvents: 'none',
                        width: 0,
                        height: 0
                      }}
                    />
                  </div>
                  <div 
                    ref={cellBgColorButtonRef}
                    className="table-header-bg-color-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      const mcpButton = e.currentTarget.parentElement.querySelector('.modern-color-picker > div');
                      if (mcpButton) {
                        if (cellBgColorButtonRef.current) {
                          const rect = cellBgColorButtonRef.current.getBoundingClientRect();
                          mcpButton.setAttribute('data-actual-left', rect.left.toString());
                          mcpButton.setAttribute('data-actual-top', rect.top.toString());
                          mcpButton.setAttribute('data-actual-bottom', rect.bottom.toString());
                          mcpButton.setAttribute('data-actual-width', rect.width.toString());
                        }
                        mcpButton.click();
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <Palette size={16} />
                  </div>
                </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Table Styles Container */}
      <div className="option-group table-styles-container" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        padding: '0.75rem'
      }}>
        <div className="table-style-grid-inline">
          {[
            { style: 'orange', colors: { header: '#FF6B35', row1: '#FFE5D9', row2: '#FFF0E6' } },
            { style: 'grey', colors: { header: '#6C757D', row1: '#E9ECEF', row2: '#F5F6F7' } },
            { style: 'yellow', colors: { header: '#FFC000', row1: '#FFF2CC', row2: '#FFF9E6' } },
            { style: 'blue', colors: { header: '#2196F3', row1: '#BBDEFB', row2: '#E3F2FD' } }
          ].map((tableStyle) => (
            <div
              key={tableStyle.style}
              className="table-style-preview-inline"
              onClick={() => {
                // Apply the selected style to the table
                const tableStyles = getTableStyles();
                const selectedStyle = tableStyles[tableStyle.style];
                if (!selectedStyle || !selectedElement.data) return;

                const newData = selectedElement.data.map((row, rowIndex) => {
                  let cellStyle;
                  if (rowIndex === 0) {
                    cellStyle = selectedStyle.header;
                  } else if (rowIndex === 1) {
                    cellStyle = selectedStyle.row1;
                  } else if (rowIndex === 2) {
                    cellStyle = selectedStyle.row2;
                  } else {
                    // For rows beyond 3, alternate between row1 and row2
                    cellStyle = (rowIndex % 2 === 1) ? selectedStyle.row1 : selectedStyle.row2;
                  }

                  return row.map(cell => ({
                    ...cell,
                    bgColor: cellStyle.bgColor,
                    textColor: cellStyle.textColor,
                    borderColor: cellStyle.borderColor,
                    borderWidth: 2,
                    fontWeight: rowIndex === 0 ? (cellStyle.fontWeight || "bold") : (cell.fontWeight || "normal")
                  }));
                });

                // Store the selected table style name
                updateSlideElement(selectedElement.id, { data: newData, tableStyle: tableStyle.style });
              }}
            >
              <div className="table-preview">
                {/* Header row */}
                <div 
                  className="table-preview-row table-preview-header"
                  style={{ backgroundColor: tableStyle.colors.header }}
                >
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                </div>
                {/* Data rows */}
                <div 
                  className="table-preview-row"
                  style={{ backgroundColor: tableStyle.colors.row1 }}
                >
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                </div>
                <div 
                  className="table-preview-row"
                  style={{ backgroundColor: tableStyle.colors.row2 }}
                >
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                </div>
                <div 
                  className="table-preview-row"
                  style={{ backgroundColor: tableStyle.colors.row1 }}
                >
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                  <div className="table-preview-cell"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">Element Actions</div>
      <div className="option-group">
        <LayerActions
          selectedElement={selectedElement}
          currentSlide={currentSlide}
          bringForward={bringForward}
          bringToFront={bringToFront}
          sendBackward={sendBackward}
          sendToBack={sendToBack}
          updateSlide={updateSlide}
          deleteElement={deleteElement}
        />
      </div>
    </div>
  );
};

export default TableOptions;

