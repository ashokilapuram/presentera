import React, { useState } from 'react';
import { 
  FiType, 
  FiSquare, 
  FiCircle, 
  FiTriangle, 
  FiStar,
  FiBarChart2,
  FiTrendingUp,
  FiPieChart,
  FiImage,
  FiChevronDown,
  FiGrid,
  FiSmile
} from 'react-icons/fi';

const InsertSection = ({ addTextBox, addShape, addChart, addImage, onClipartClick, addTable }) => {
  const [showMoreShapes, setShowMoreShapes] = useState(false);

  // SVG icons for pentagon and hexagon
  const PentagonIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      pointerEvents="none"
    >
      <path d="M12 2L20 7L17 20H7L4 7L12 2Z" />
    </svg>
  );

  const HexagonIcon = () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      pointerEvents="none"
    >
      <path d="M12 2L20 7L20 17L12 22L4 17L4 7L12 2Z" />
    </svg>
  );


  return (
    <div className="right-toolbar-section">
      <div className="section-title">Text elements</div>
      <div className="text-elements-row">
        <button className="text-element-button" onClick={() => addTextBox('title')}>
          <FiType />
          <span>Title</span>
        </button>
        <button className="text-element-button" onClick={() => addTextBox('subtitle')}>
          <FiType />
          <span>Subtitle</span>
        </button>
        <button className="text-element-button" onClick={() => addTextBox('content')}>
          <FiType />
          <span>Content</span>
        </button>
      </div>

      <div className="section-title shapes-section-title">
        <span>Shapes</span>
        <button 
          className="shapes-more-button"
          onClick={() => setShowMoreShapes(!showMoreShapes)}
          title={showMoreShapes ? "Show less shapes" : "Show more shapes"}
        >
          <FiChevronDown style={{ transform: showMoreShapes ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>
      </div>
      <div className="shapes-row">
        <button 
          className="shape-icon-button" 
          onClick={(e) => {
            e.stopPropagation();
            addShape('square');
          }} 
          title="Square (resizable)"
        >
          <FiSquare />
        </button>
        <button 
          className="shape-icon-button" 
          onClick={(e) => {
            e.stopPropagation();
            addShape('circle');
          }}
        >
          <FiCircle />
        </button>
        <button 
          className="shape-icon-button" 
          onClick={(e) => {
            e.stopPropagation();
            addShape('triangle');
          }}
        >
          <FiTriangle />
        </button>
        <button 
          className="shape-icon-button" 
          onClick={(e) => {
            e.stopPropagation();
            addShape('star');
          }}
        >
          <FiStar />
        </button>
      </div>
      {showMoreShapes && (
        <div className="shapes-row">
          <button 
            className="shape-icon-button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addShape('pentagon');
            }} 
            onMouseDown={(e) => e.stopPropagation()}
            title="Pentagon"
          >
            <PentagonIcon />
          </button>
          <button 
            className="shape-icon-button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addShape('hexagon');
            }} 
            onMouseDown={(e) => e.stopPropagation()}
            title="Hexagon"
          >
            <HexagonIcon />
          </button>
        </div>
      )}

      <div className="section-title">Charts</div>
      <div className="charts-row">
        <button className="chart-element-button" onClick={() => addChart('bar')}>
          <FiBarChart2 />
          <span>Bar</span>
        </button>
        <button className="chart-element-button" onClick={() => addChart('line')}>
          <FiTrendingUp />
          <span>Line</span>
        </button>
        <button className="chart-element-button" onClick={() => addChart('pie')}>
          <FiPieChart />
          <span>Pie</span>
        </button>
      </div>

      <div className="section-title">Media</div>
      <div className="media-row">
        <button className="media-element-button" onClick={addImage}>
          <FiImage />
          <span>Image</span>
        </button>
        <button className="media-element-button" onClick={onClipartClick}>
          <FiSmile />
          <span>Clipart</span>
        </button>
      </div>

      <div className="section-title">Tables</div>
      <div className="media-row">
        <button className="media-element-button" onClick={() => addTable()}>
          <FiGrid />
          <span>Table</span>
        </button>
      </div>
    </div>
  );
};

export default InsertSection;


