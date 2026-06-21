import { createPortal } from 'react-dom';
import ReactPlayer from 'react-player';
import '../css/TrailerModal.css'

function TrailerModal({ youtubeKey, onClose }) {
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div className="player-wrapper">
                    <ReactPlayer
                        src={`https://www.youtube.com/watch?v=${youtubeKey}`}
                        playing={true}
                        muted={true}
                        controls={true}
                        width="100%"
                        height="100%"
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                </div>
            </div>
        </div>,
        document.body
    )
}

export default TrailerModal