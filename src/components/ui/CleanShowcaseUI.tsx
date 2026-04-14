import './CleanShowcaseUI.css';

export const CleanShowcaseUI = () => {
  return (
    <div className="clean-showcase-container">
      {/* 90s Header */}
      <div className="clean-header">
        <div className="clean-header-box">
          <h1 className="clean-header-title">
            NINJA <span className="clean-header-span">TURDLES</span>
          </h1>
        </div>
        <div className="clean-header-subtitle">
          ULTIMATE_EDITION.exe
        </div>
      </div>

      {/* Data Box */}
      <div className="clean-data-box">
        <div className="clean-data-container">
          <div className="clean-data-header">
            {'>> ASSET_INTEL'}
          </div>
          <div className="clean-data-label">RATING:</div>
          <div className="clean-data-rating">STANDARD</div>
          <div className="clean-data-value-section">
            <div className="clean-data-value-container">
              <div className="clean-data-label">VALUE:</div>
              <div className="clean-data-value">50</div>
            </div>
            <div className="clean-data-badge">
              P
            </div>
          </div>
        </div>
      </div>

      {/* VHS Overlay */}
      <div className="clean-vhs-overlay">
        PLAY ▶ 00:24:96:SP
      </div>

      {/* Showcase Sticker */}
      <div className="clean-showcase-sticker">
        <div className="clean-showcase-sticker-box">
          SHOWCASE!!
        </div>
      </div>
    </div>
  );
};
