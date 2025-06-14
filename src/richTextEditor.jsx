import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Box,
    Paper,
    Toolbar,
    IconButton,
    Divider,
    Select,
    MenuItem,
    FormControl,
    Tooltip,
    Typography,
    Chip,
    Badge,
    Fade,
    Zoom,
    CircularProgress
} from '@mui/material';
import {
    FormatBold,
    FormatItalic,
    FormatUnderlined,
    FormatListBulleted,
    FormatListNumbered,
    Link,
    Image,
    Code,
    Undo,
    Redo,
    FormatClear,
    TextFields,
    AutoAwesome
} from '@mui/icons-material';
import axios from "axios";

const RichTextEditor = ({
                            value = '',
                            onChange,
                            placeholder = 'Start typing...',
                            minHeight = 300,
                            disabled = false
                        }) => {
    const editorRef = useRef(null);
    const [content, setContent] = useState(value);
    const [fontSize, setFontSize] = useState(16);
    const [history, setHistory] = useState([value]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [wordCount, setWordCount] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (editorRef.current) {
            const initialContent = value || '';
            setContent(initialContent);
            editorRef.current.innerHTML = initialContent;
            setHistory([initialContent]);
            setHistoryIndex(0);
        }
    }, []);

    useEffect(() => {
        if (value !== content && editorRef.current) {
            setContent(value);
            editorRef.current.innerHTML = value;
            saveToHistory(value);
        }
    }, [value]);

    useEffect(() => {
        const text = content.replace(/<[^>]*>/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        setWordCount(words);
    }, [content]);

    const saveToHistory = useCallback(
        (newContent) => {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newContent);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        },
        [history, historyIndex]
    );

    const handleContentChange = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            setContent(newContent);
            saveToHistory(newContent);
            if (onChange) {
                onChange(newContent);
            }
        }
    };

    const executeCommand = useCallback(
        (command, value = null) => {
            if (disabled) return;
            document.execCommand(command, false, value);
            handleContentChange();
            editorRef.current.focus();
        },
        [disabled]
    );

    const formatText = useCallback(
        (format) => {
            switch (format) {
                case 'bold':
                case 'italic':
                case 'underline':
                    executeCommand(format);
                    break;
                case 'code':
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0 && !selection.isCollapsed) {
                        const range = selection.getRangeAt(0);
                        const selectedText = range.toString();
                        if (selectedText) {
                            const codeElement = document.createElement('code');
                            codeElement.style.backgroundColor = '#f5f5f5';
                            codeElement.style.padding = '2px 4px';
                            codeElement.style.borderRadius = '3px';
                            codeElement.style.fontFamily = 'monospace';

                            const fragment = document.createDocumentFragment();
                            const textNode = document.createTextNode(selectedText);
                            fragment.appendChild(textNode);

                            range.deleteContents();
                            codeElement.appendChild(fragment);
                            range.insertNode(codeElement);

                            selection.removeAllRanges();
                            const newRange = document.createRange();
                            newRange.selectNodeContents(codeElement);
                            selection.addRange(newRange);

                            handleContentChange();
                        }
                    }
                    break;
                default:
                    break;
            }
        },
        [executeCommand]
    );

    const insertLink = useCallback(() => {
        const selection = window.getSelection();
        let linkText = '';
        let url = '';

        if (selection.rangeCount > 0 && !selection.isCollapsed) {
            linkText = selection.toString();
        }

        if (!linkText) {
            linkText = prompt('Enter link text:', '');
            if (!linkText) return;
        }

        url = prompt('Enter URL:', 'https://');
        if (!url) return;

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.textContent = linkText;
            linkElement.style.color = '#1976d2';
            linkElement.style.textDecoration = 'underline';
            linkElement.style.cursor = 'pointer';
            linkElement.target = '_blank';

            if (!selection.isCollapsed) {
                range.deleteContents();
            }
            range.insertNode(linkElement);

            range.setStartAfter(linkElement);
            range.collapse(true);
            selection.removeAllRanges();
            handleContentChange();
        }
    }, []);

    const insertImage = useCallback(async () => {
        if (disabled || isUploading) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
                setIsUploading(true);
                try {
                    if (file.size > 10 * 1024 * 1024) {
                        alert('File size should be less than 10MB');
                        setIsUploading(false);
                        return;
                    }

                    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

                    if (!cloudName || !uploadPreset) {
                        throw new Error('Missing Cloudinary configuration. Please check your environment variables.');
                    }

                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('upload_preset', uploadPreset);

                    const response = await axios.post(
                        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                        formData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        }
                    );

                    const data = response.data;

                    const img = document.createElement('img');
                    img.src = data.secure_url;
                    img.alt = file.name;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.borderRadius = '12px';
                    img.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                    img.style.cursor = 'pointer';
                    img.style.transition = 'all 0.3s ease';

                    img.onmouseenter = () => {
                        img.style.transform = 'scale(1.02)';
                        img.style.boxShadow = '0 12px 48px rgba(0, 0, 0, 0.15)';
                    };
                    img.onmouseleave = () => {
                        img.style.transform = 'scale(1)';
                        img.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
                    };

                    const selection = window.getSelection();
                    if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(img);
                        const br = document.createElement('br');
                        range.collapse(false);
                        range.insertNode(br);
                        selection.removeAllRanges();
                        handleContentChange();
                    }

                } catch (error) {
                    console.error('Upload Error:', error);
                    alert('Image upload failed. Please try again.');
                } finally {
                    setIsUploading(false);
                }
            }
        };

        input.click();
    }, [disabled, isUploading]);

    const insertList = useCallback(
        (type) => {
            if (type === 'bullet') {
                executeCommand('insertUnorderedList');
            } else {
                executeCommand('insertOrderedList');
            }
        },
        [executeCommand]
    );

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const previousContent = history[newIndex];
            setContent(previousContent);
            setHistoryIndex(newIndex);
            if (editorRef.current) {
                editorRef.current.innerHTML = previousContent;
            }
            if (onChange) {
                onChange(previousContent);
            }
        }
    }, [history, historyIndex, onChange]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const nextContent = history[newIndex];
            setContent(nextContent);
            setHistoryIndex(newIndex);
            if (editorRef.current) {
                editorRef.current.innerHTML = nextContent;
            }
            if (onChange) {
                onChange(nextContent);
            }
        }
    }, [history, historyIndex, onChange]);

    const clearContent = useCallback(() => {
        if (window.confirm('Are you sure you want to clear all content?')) {
            setContent('');
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }
            saveToHistory('');
            if (onChange) {
                onChange('');
            }
        }
    }, [onChange, saveToHistory]);

    const handleFontSizeChange = useCallback(
        (newSize) => {
            setFontSize(newSize);
            if (editorRef.current) {
                editorRef.current.style.fontSize = `${newSize}px`;
            }
            handleContentChange();
        },
        []
    );

    const handleKeyDown = useCallback(
        (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        formatText('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        formatText('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        formatText('underline');
                        break;
                    case 'z':
                        e.preventDefault();
                        e.shiftKey ? handleRedo() : handleUndo();
                        break;
                    case 'y':
                        e.preventDefault();
                        handleRedo();
                        break;
                    default:
                        break;
                }
            }
        },
        [formatText, handleUndo, handleRedo]
    );

    const handleEditorClick = useCallback((e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const url = e.target.href;
            if (url) window.open(url, '_blank');
        }
    }, []);

    const handleImageClick = useCallback(
        (e) => {
            const target = e.target;
            if (target.tagName === 'IMG') {
                const confirmed = window.confirm('Do you want to remove this image?');
                if (confirmed) {
                    target.remove();
                    handleContentChange();
                }
            }
        },
        [handleContentChange]
    );

    const ToolbarButton = ({ icon: Icon, onClick, tooltip, disabled: btnDisabled = false, isActive = false }) => (
        <Tooltip title={tooltip} arrow>
            <span>
                <Zoom in={true} timeout={300}>
                    <IconButton
                        size="small"
                        onClick={onClick}
                        disabled={disabled || btnDisabled}
                        sx={{
                            margin: '2px',
                            color: isActive ? '#fff' : '#555',
                            background: isActive
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            borderRadius: 2,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isActive ? 'translateY(-1px)' : 'translateY(0)',
                            boxShadow: isActive
                                ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                                : 'none',
                            '&:hover': {
                                background: isActive
                                    ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                                    : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)'
                            },
                            '&.Mui-disabled': {
                                opacity: 0.3,
                                transform: 'none'
                            }
                        }}
                    >
                        <Icon fontSize="small" />
                    </IconButton>
                </Zoom>
            </span>
        </Tooltip>
    );

    return (
        <Box sx={{ position: 'relative' }}>
            <Paper
                elevation={isActive ? 12 : 6}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                    border: isActive
                        ? '2px solid transparent'
                        : '1px solid #e2e8f0',
                    backgroundClip: 'padding-box',
                    position: 'relative',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                    '&::before': isActive ? {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: 4,
                        padding: '2px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'exclude',
                        zIndex: -1
                    } : {}
                }}
            >
                {/* Header with title and stats */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        px: 3,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AutoAwesome sx={{ fontSize: 24 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                            Text Editor
                        </Typography>
                        {isUploading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={16} sx={{ color: 'white' }} />
                                <Typography variant="caption">Uploading...</Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Fade in={wordCount > 0} timeout={500}>
                            <Chip
                                icon={<TextFields />}
                                label={`${wordCount} words`}
                                size="small"
                                sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    backdropFilter: 'blur(10px)',
                                    '& .MuiChip-icon': { color: 'white' }
                                }}
                            />
                        </Fade>
                        <Chip
                            label={`${history.length} versions`}
                            size="small"
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                backdropFilter: 'blur(10px)'
                            }}
                        />
                    </Box>
                </Box>

                {/* Enhanced Toolbar */}
                <Toolbar
                    variant="dense"
                    sx={{
                        background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
                        backdropFilter: 'blur(20px)',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                        px: 3,
                        py: 1.5,
                        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    }}
                >
                    {/* Font Size Selector */}
                    <FormControl size="small" sx={{ minWidth: 90, mr: 1 }}>
                        <Select
                            value={fontSize}
                            onChange={(e) => handleFontSizeChange(e.target.value)}
                            disabled={disabled}
                            sx={{
                                height: 32,
                                fontSize: 14,
                                borderRadius: 2,
                                background: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
                                border: '1px solid #e2e8f0',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none'
                                },
                                '&:hover': {
                                    background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                }
                            }}
                        >
                            {[12, 14, 16, 18, 20, 24].map((size) => (
                                <MenuItem key={size} value={size}>
                                    {size}px
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 1,
                            background: 'linear-gradient(180deg, transparent 0%, #cbd5e1 50%, transparent 100%)'
                        }}
                    />

                    {/* Format Buttons */}
                    <ToolbarButton icon={FormatBold} onClick={() => formatText('bold')} tooltip="Bold (Ctrl+B)" />
                    <ToolbarButton icon={FormatItalic} onClick={() => formatText('italic')} tooltip="Italic (Ctrl+I)" />
                    <ToolbarButton icon={FormatUnderlined} onClick={() => formatText('underline')} tooltip="Underline (Ctrl+U)" />
                    <ToolbarButton icon={Code} onClick={() => formatText('code')} tooltip="Code" />

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 1,
                            background: 'linear-gradient(180deg, transparent 0%, #cbd5e1 50%, transparent 100%)'
                        }}
                    />

                    {/* List Buttons */}
                    <ToolbarButton icon={FormatListBulleted} onClick={() => insertList('bullet')} tooltip="Bullet List" />
                    <ToolbarButton icon={FormatListNumbered} onClick={() => insertList('numbered')} tooltip="Numbered List" />

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 1,
                            background: 'linear-gradient(180deg, transparent 0%, #cbd5e1 50%, transparent 100%)'
                        }}
                    />

                    {/* Insert Buttons */}
                    <ToolbarButton icon={Link} onClick={insertLink} tooltip="Insert Link" />
                    <ToolbarButton
                        icon={Image}
                        onClick={insertImage}
                        tooltip="Insert Image (Upload to Cloudinary)"
                        disabled={isUploading}
                    />

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 1,
                            background: 'linear-gradient(180deg, transparent 0%, #cbd5e1 50%, transparent 100%)'
                        }}
                    />

                    <Badge
                        color="primary"
                        sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}
                    >
                        <ToolbarButton
                            icon={Undo}
                            onClick={handleUndo}
                            tooltip="Undo (Ctrl+Z)"
                            disabled={historyIndex <= 0}
                        />
                    </Badge>
                    <Badge
                        color="secondary"
                        sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 16, height: 16 } }}
                    >
                        <ToolbarButton
                            icon={Redo}
                            onClick={handleRedo}
                            tooltip="Redo (Ctrl+Y)"
                            disabled={historyIndex >= history.length - 1}
                        />
                    </Badge>

                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            mx: 1,
                            background: 'linear-gradient(180deg, transparent 0%, #cbd5e1 50%, transparent 100%)'
                        }}
                    />

                    <ToolbarButton
                        icon={FormatClear}
                        onClick={clearContent}
                        tooltip="Clear All"
                    />
                </Toolbar>

                {/* Editor Area */}
                <Box
                    ref={editorRef}
                    contentEditable={!disabled}
                    onInput={handleContentChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsActive(true)}
                    onBlur={() => setIsActive(false)}
                    onClick={(e) => {
                        handleEditorClick(e);
                        handleImageClick(e);
                    }}
                    sx={{
                        height: `${minHeight}px`,
                        overflowY: 'auto',
                        padding: 3,
                        fontSize: `${fontSize}px`,
                        lineHeight: 1.7,
                        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                        outline: 'none',
                        cursor: disabled ? 'not-allowed' : 'text',
                        background: disabled
                            ? 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)'
                            : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        '&:empty::before': {
                            content: `"${placeholder}"`,
                            color: '#94a3b8',
                            fontStyle: 'italic',
                            fontSize: '1.1em'
                        },
                        '& img': {
                            maxWidth: '100%',
                            height: 'auto',
                            cursor: 'pointer',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.02)',
                                boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)'
                            }
                        },
                        '& ul, & ol': {
                            paddingLeft: '24px',
                            margin: '12px 0'
                        },
                        '& li': {
                            marginBottom: '6px',
                            lineHeight: 1.6
                        },
                        '& a': {
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            textDecoration: 'none',
                            borderBottom: '2px solid transparent',
                            borderImage: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) 1',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderBottom: '2px solid #3b82f6'
                            }
                        },
                        '& code': {
                            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                            color: '#e11d48',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontFamily: '"Fira Code", "Monaco", "Cascadia Code", monospace',
                            fontSize: '0.9em',
                            fontWeight: 500,
                            border: '1px solid #e2e8f0',
                            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
                        }
                    }}
                    suppressContentEditableWarning={true}
                />

                {/* Status Bar */}
                <Box
                    sx={{
                        background: 'linear-gradient(90deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)',
                        borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                        px: 3,
                        py: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {isUploading ? 'Uploading image...' : content.length > 0 ? 'Ready' : 'Start typing to begin...'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {content.replace(/<[^>]*>/g, '').length} characters
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default RichTextEditor;