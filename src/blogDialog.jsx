// src/BlogDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    Typography
} from '@mui/material';
import RichTextEditor from "../src/richTextEditor.jsx";

const types = [
    {label: 'Earn Money', value: 'earn-money'},
    {label: 'Latest News', value: 'latest-news'},
    {label: 'AI Tools', value: 'ai-tools'},
];

const BlogDialog = ({open, onClose, formData, onChange, onSubmit, isEditing}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            sx={{
                '& .MuiDialog-paper': {
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle>{isEditing ? 'Edit Blog' : 'Create Blog'}</DialogTitle>
            <DialogContent sx={{pb: 1}}>
                <TextField
                    label="Title"
                    fullWidth
                    margin="normal"
                    value={formData.title}
                    onChange={e => onChange('title', e.target.value)}
                />

                <Box sx={{mt: 2, mb: 2}}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        Content
                    </Typography>
                    <RichTextEditor
                        value={formData.content || ''}
                        onChange={(content) => onChange('content', content)}
                        placeholder="Write your blog content here..."
                        minHeight={250}
                    />
                </Box>


                <TextField
                    label="Type"
                    select
                    fullWidth
                    margin="normal"
                    value={formData.type}
                    onChange={e => onChange('type', e.target.value)}
                >
                    {types.map(t => (
                        <MenuItem key={t.value} value={t.value}>
                            {t.label}
                        </MenuItem>
                    ))}
                </TextField>

                <Box sx={{mt: 2}}>
                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        Image
                    </Typography>
                    <input
                        type="file"
                        accept="image/*"
                        style={{
                            marginTop: 8,
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            width: '100%'
                        }}
                        onChange={e => onChange('image', e.target.files[0])}
                    />
                    {formData.image && typeof formData.image === 'string' && (
                        <Box sx={{mt: 1}}>
                            <img
                                src={formData.image}
                                alt="Preview"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: 150,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                            />
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{px: 3, pb: 2}}>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onSubmit}>
                    {isEditing ? 'Update' : 'Create'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BlogDialog;