import React from 'react';
import FontFamilyDropdown from './FontFamilyDropdown';
import FontSizeControls from './FontSizeControls';
import FormattingButtons from './FormattingButtons';
import AlignmentToggle from './AlignmentToggle';
import ListToggle from './ListToggle';
import TextSpacingDropdown from './TextSpacingDropdown';
import CapitalizeToggle from './CapitalizeToggle';
import ColorPickerButton from './ColorPickerButton';

/**
 * Container for all text formatting options
 */
const FormattingContainer = ({
  selectedElement,
  textFormatting,
  activeDropdown,
  dropdownPos,
  onOpenDropdown,
  onOpenSpacing,
  onApplyFormat,
  onToggleStyle,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onToggleAlignment,
  onToggleList,
  onToggleCapitalize,
  onColorButtonClick,
  onColorChange,
  setActiveDropdown
}) => {
  return (
    <div className="format-container">
      {/* Font Family Dropdown */}
      <FontFamilyDropdown
        selectedElement={selectedElement}
        textFormatting={textFormatting}
        onOpenDropdown={onOpenDropdown}
        activeDropdown={activeDropdown}
        dropdownPos={dropdownPos}
        onApplyFormat={(property, value) => {
          onApplyFormat(property, value);
          setActiveDropdown(null);
        }}
      />

      {/* Font Size Controls */}
      <FontSizeControls
        selectedElement={selectedElement}
        textFormatting={textFormatting}
        onDecrease={onDecreaseFontSize}
        onIncrease={onIncreaseFontSize}
      />

      {/* Separator */}
      <div className="formatting-separator">|</div>

      {/* Font Style Buttons */}
      <FormattingButtons
        selectedElement={selectedElement}
        textFormatting={textFormatting}
        onToggleStyle={onToggleStyle}
      />

      {/* Separator */}
      <div className="formatting-separator">|</div>

      {/* Alignment Toggle */}
      <AlignmentToggle
        selectedElement={selectedElement}
        textFormatting={textFormatting}
        onToggleAlignment={onToggleAlignment}
      />

      {/* List Toggle */}
      <ListToggle
        selectedElement={selectedElement}
        textFormatting={textFormatting}
        onToggleList={onToggleList}
      />

      {/* Text Spacing Dropdown */}
      <TextSpacingDropdown
        selectedElement={selectedElement}
        textFormatting={textFormatting}
        activeDropdown={activeDropdown}
        dropdownPos={dropdownPos}
        onOpenSpacing={onOpenSpacing}
        onApplyFormat={onApplyFormat}
      />

      {/* Capitalize Toggle */}
      <CapitalizeToggle
        selectedElement={selectedElement}
        textFormatting={textFormatting}
        onToggleCapitalize={onToggleCapitalize}
      />

      {/* Separator */}
      <div className="formatting-separator">|</div>

      {/* Font Color */}
      <ColorPickerButton
        selectedElement={selectedElement}
        textFormatting={textFormatting}
        onColorButtonClick={onColorButtonClick}
        onColorChange={onColorChange}
      />
    </div>
  );
};

export default FormattingContainer;

