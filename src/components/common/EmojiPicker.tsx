import React from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  showEmojiPicker: boolean;
  onClose: () => void;
}

const EmojiPickerComponent: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  showEmojiPicker,
  onClose
}) => {
  if (!showEmojiPicker) return null;

  const onEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <div className="absolute right-0 bottom-10 z-10">
      <EmojiPicker
        onEmojiClick={onEmojiClick}
        theme={Theme.LIGHT}
        searchDisabled={false}
        skinTonesDisabled
        width={300}
        height={350}
      />
    </div>
  );
};

export default EmojiPickerComponent; 