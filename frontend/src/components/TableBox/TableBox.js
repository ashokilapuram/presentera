import React, { useRef, useEffect, useState, useCallback } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import { Html } from "react-konva-utils";

/**
 * EditableCell - Individual cell component with double-click editing
 */
const EditableCell = ({ 
  x, 
  y, 
  width, 
  height, 
  cellData, 
  rowIndex, 
  colIndex,
  isSelected,
  isEditing: isEditingProp,
  onCellClick,
  onCellDblClick,
  onChange,
  onCancelEdit,
  stageScale = 1,
  groupX = 0,
  groupY = 0
}) => {
  const [value, setValue] = useState(cellData?.text || "");
  const textareaRef = useRef(null);
  const rectRef = useRef(null);

  // Sync value with cellData
  useEffect(() => {
    if (!isEditingProp) {
      setValue(cellData?.text || "");
    }
  }, [cellData?.text, isEditingProp]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditingProp && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Place cursor at the end of text
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 10);
    }
  }, [isEditingProp]);

  const handleDblClick = (e) => {
    e.cancelBubble = true;
    if (e.evt) {
      e.evt.stopPropagation();
    }
    onCellClick && onCellClick(rowIndex, colIndex);
    onCellDblClick && onCellDblClick(rowIndex, colIndex);
  };

  const handleBlur = () => {
    onChange && onChange(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === "Escape") {
      setValue(cellData?.text || "");
      onCancelEdit && onCancelEdit();
    }
  };

  const cellStyle = cellData || {};
  const padding = 5;
  const fontSize = (cellStyle.fontSize || 14) * stageScale;

  // Calculate absolute position for Html overlay
  const absoluteX = groupX + x;
  const absoluteY = groupY + y;

  return (
    <>
      <Rect
        ref={rectRef}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={cellStyle.bgColor || "#ffffff"}
        stroke={cellStyle.borderColor || "#cccccc"}
        strokeWidth={(cellStyle.borderWidth || 1) * stageScale}
        onClick={(e) => {
          e.cancelBubble = true;
          onCellClick && onCellClick(rowIndex, colIndex);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onCellClick && onCellClick(rowIndex, colIndex);
        }}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
      />
      {!isEditingProp && (
        <Text
          x={x + padding}
          y={y + padding}
          width={width - padding * 2}
          height={height - padding * 2}
          text={value}
          fontSize={fontSize}
          fontFamily={cellStyle.fontFamily || "Arial"}
          fontStyle={`${cellStyle.fontStyle === 'italic' ? 'italic ' : ''}${cellStyle.fontWeight === 'bold' ? 'bold' : 'normal'}`.trim()}
          fill={cellStyle.textColor || "#000000"}
          textDecoration={cellStyle.textDecoration || 'none'}
          align={cellStyle.align || "left"}
          verticalAlign="middle"
          wrap="word"
          ellipsis={true}
          listening={false}
        />
      )}
    </>
  );
};

/**
 * TableBox - Main table component with draggable, resizable functionality
 */
const TableBox = ({ element, isSelected, onSelect, onChange, readOnly = false }) => {
  const groupRef = useRef(null);
  const transformerRef = useRef(null);
  const textareaRef = useRef(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [stageScale, setStageScale] = useState(1);

  // Initialize table data if not present
  useEffect(() => {
    if (!element.data || element.data.length === 0) {
      const rows = element.rows || 3;
      const cols = element.cols || 4;
      const initialData = Array(rows).fill(null).map(() =>
        Array(cols).fill(null).map(() => ({
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
        }))
      );
      onChange({ data: initialData });
    }
  }, [element.data, element.rows, element.cols, onChange]);

  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Get stage scale for proper text rendering
  useEffect(() => {
    if (groupRef.current && groupRef.current.getStage()) {
      const scale = groupRef.current.getStage().scaleX();
      setStageScale(scale);
    }
  }, [isSelected]);

  // Calculate cell dimensions
  const rows = element.rows || 3;
  const cols = element.cols || 4;
  const cellWidth = element.cellWidth || (element.width / cols);
  const cellHeight = element.cellHeight || (element.height / rows);
  const data = element.data || [];

  // Handle cell click
  const handleCellClick = useCallback((rowIndex, colIndex) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    onSelect && onSelect();
  }, [onSelect]);

  // Handle cell double-click to start editing
  const handleCellDblClick = useCallback((rowIndex, colIndex) => {
    const cellData = data[rowIndex]?.[colIndex];
    setEditingCell({ row: rowIndex, col: colIndex });
    setEditingValue(cellData?.text || "");
  }, [data]);

  // Handle cell content change
  const handleCellChange = useCallback((rowIndex, colIndex, newText) => {
    const newData = data.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => {
          if (cIdx === colIndex) {
            return { ...cell, text: newText };
          }
          return cell;
        });
      }
      return row;
    });
    onChange({ data: newData });
  }, [data, onChange]);

  // Handle drag end
  const handleDragEnd = useCallback((e) => {
    onChange({
      x: e.target.x(),
      y: e.target.y()
    });
  }, [onChange]);

  // Handle transform end
  const handleTransformEnd = useCallback(() => {
    const node = groupRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and update dimensions
    node.scaleX(1);
    node.scaleY(1);

    const newWidth = Math.max(100, node.width() * scaleX);
    const newHeight = Math.max(50, node.height() * scaleY);

    // Recalculate cell dimensions
    const newCellWidth = newWidth / cols;
    const newCellHeight = newHeight / rows;

    onChange({
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      cellWidth: newCellWidth,
      cellHeight: newCellHeight,
      rotation: node.rotation()
    });
  }, [onChange, cols, rows]);

  // Render cells
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellData = data[r]?.[c] || {
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

      cells.push(
        <EditableCell
          key={`${r}-${c}`}
          x={c * cellWidth}
          y={r * cellHeight}
          width={cellWidth}
          height={cellHeight}
          cellData={cellData}
          rowIndex={r}
          colIndex={c}
          isSelected={selectedCell?.row === r && selectedCell?.col === c}
          isEditing={editingCell?.row === r && editingCell?.col === c}
          onCellClick={handleCellClick}
          onCellDblClick={handleCellDblClick}
          onChange={(newText) => {
            handleCellChange(r, c, newText);
            setEditingCell(null);
          }}
          onCancelEdit={() => setEditingCell(null)}
          stageScale={stageScale}
          groupX={element.x}
          groupY={element.y}
        />
      );
    }
  }

  // Get editing cell data for Html overlay
  const editingCellData = editingCell && data[editingCell.row]?.[editingCell.col];
  const editingCellStyle = editingCellData || {};
  const editingCellX = editingCell ? editingCell.col * cellWidth : 0;
  const editingCellY = editingCell ? editingCell.row * cellHeight : 0;
  const padding = 5;

  // Focus textarea when editing starts
  useEffect(() => {
    if (editingCell && textareaRef.current) {
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Place cursor at the end of text
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 10);
    }
  }, [editingCell]);

  return (
    <>
      <Group
        ref={groupRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        draggable={!readOnly && !editingCell}
        onClick={(e) => {
          if (e.target === groupRef.current || e.target.getParent() === groupRef.current) {
            e.cancelBubble = true;
            onSelect && onSelect();
          }
        }}
        onTap={(e) => {
          if (e.target === groupRef.current || e.target.getParent() === groupRef.current) {
            e.cancelBubble = true;
            onSelect && onSelect();
          }
        }}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      >
        {cells}
      </Group>
      {editingCell && editingCellData && (
        <Html>
          <textarea
            ref={textareaRef}
            style={{
              position: "absolute",
              top: element.y + editingCellY,
              left: element.x + editingCellX,
              width: cellWidth,
              height: cellHeight,
              fontSize: (editingCellStyle.fontSize || 14) * stageScale,
              fontFamily: editingCellStyle.fontFamily || "Arial",
              fontWeight: editingCellStyle.fontWeight || "normal",
              fontStyle: editingCellStyle.fontStyle || "normal",
              textDecoration: editingCellStyle.textDecoration || "none",
              color: editingCellStyle.textColor || "#000000",
              background: editingCellStyle.bgColor || "#ffffff",
              border: `${(editingCellStyle.borderWidth || 1) * stageScale}px solid ${editingCellStyle.borderColor || "#cccccc"}`,
              outline: "none",
              resize: "none",
              padding: `${padding}px`,
              margin: 0,
              boxSizing: "border-box",
              textAlign: editingCellStyle.align || "left",
              zIndex: 1000,
              borderRadius: 0,
              lineHeight: "normal",
              display: "flex",
              alignItems: "center",
            }}
            value={editingValue}
            onChange={(e) => {
              setEditingValue(e.target.value);
            }}
            onBlur={() => {
              // Save the value when blurring
              const newData = data.map((row, rIdx) => {
                if (rIdx === editingCell.row) {
                  return row.map((cell, cIdx) => {
                    if (cIdx === editingCell.col) {
                      return { ...cell, text: editingValue };
                    }
                    return cell;
                  });
                }
                return row;
              });
              onChange({ data: newData });
              setEditingCell(null);
              // Force refresh transformer after editing
              if (transformerRef.current && groupRef.current) {
                setTimeout(() => {
                  transformerRef.current.nodes([groupRef.current]);
                  transformerRef.current.getLayer().batchDraw();
                }, 0);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                // Save the value
                const newData = data.map((row, rIdx) => {
                  if (rIdx === editingCell.row) {
                    return row.map((cell, cIdx) => {
                      if (cIdx === editingCell.col) {
                        return { ...cell, text: editingValue };
                      }
                      return cell;
                    });
                  }
                  return row;
                });
                onChange({ data: newData });

              // Calculate next cell position (move to next row in same column)
              let nextRow = editingCell.row + 1;
              const nextCol = editingCell.col;

                // If we haven't reached the last cell of the table
                if (nextRow < rows) {
                  // Move to next cell
                  const nextCellData = data[nextRow]?.[nextCol];
                  setEditingCell({ row: nextRow, col: nextCol });
                  setEditingValue(nextCellData?.text || "");
                } else {
                  // If we're at the last cell, just close editing
                  setEditingCell(null);
                  // Force refresh transformer after editing
                  if (transformerRef.current && groupRef.current) {
                    setTimeout(() => {
                      transformerRef.current.nodes([groupRef.current]);
                      transformerRef.current.getLayer().batchDraw();
                    }, 0);
                  }
                }
              } else if (e.key === "Escape") {
                setEditingCell(null);
                setEditingValue(editingCellData?.text || "");
              }
            }}
            autoFocus
          />
        </Html>
      )}
      {isSelected && !readOnly && !editingCell && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
            "top-center",
            "bottom-center"
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            // Minimum size constraints
            const minWidth = cols * 50;
            const minHeight = rows * 30;
            return {
              ...newBox,
              width: Math.max(minWidth, newBox.width),
              height: Math.max(minHeight, newBox.height)
            };
          }}
        />
      )}
    </>
  );
};

export default TableBox;

