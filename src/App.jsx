import React, {useEffect, useState} from "react";
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Snackbar,
    Alert,
    Box,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    CardMedia,
    Chip,
    Avatar,
    Fade,
    Slide,
    useTheme,
    alpha,
    Tooltip,
    Divider,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Article as ArticleIcon,
    Image as ImageIcon,
    Dashboard as DashboardIcon,
} from "@mui/icons-material";

import BlogDialog from "../src/blogDialog";
import {getBlogs, createBlog, updateBlog, deleteBlog} from "./api";

function stripHtml(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

const App = () => {
    const theme = useTheme();
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [viewBlog, setViewBlog] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        image: null,
        type: "",
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // Categories for filtering
    const categories = [
        {value: "", label: "All Categories"},
        {value: "earn-money", label: "Earn Money"},
        {value: "latest-news", label: "Latest News"},
        {value: "ai-tools", label: "AI Tools"},
    ];

    const showSnackbar = (msg, severity = "success") => {
        setSnackbar({open: true, message: msg, severity});
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleOpenDialog = (blog = null) => {
        setIsEditing(!!blog);
        setCurrentBlog(blog);
        setFormData(
            blog
                ? {
                    title: blog.title,
                    content: blog.content,
                    image: blog.image || null,
                    type: blog.type,
                }
                : {title: "", content: "", image: null, type: ""}
        );
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setCurrentBlog(null);
        setFormData({title: "", content: "", image: null, type: ""});
    };

    const handleSubmit = async () => {
        try {
            if (!formData.title.trim()) {
                showSnackbar("Title is required", "error");
                return;
            }

            if (
                !formData.image ||
                typeof formData.image !== "string" ||
                formData.image.trim() === ""
            ) {
                showSnackbar("Image is required", "error");
                return;
            }

            if (isEditing && currentBlog) {
                await updateBlog(currentBlog._id, formData);
                showSnackbar("Blog updated");
            } else {
                await createBlog(formData);
                showSnackbar("Blog created");
            }

            handleCloseDialog();
            fetchBlogs();
        } catch (error) {
            console.error("Save error:", error);
            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Error saving blog";
            showSnackbar(message, "error");
        }
    };

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const {data} = await getBlogs();
            setBlogs(data);
            setFilteredBlogs(data);
        } catch {
            showSnackbar("Failed to load blogs", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deleteBlog(id);
            showSnackbar("Blog deleted");
            fetchBlogs();
        } catch {
            showSnackbar("Failed to delete blog", "error");
        }
    };

    // Filter and search logic
    const applyFilters = () => {
        let filtered = [...blogs];

        // Apply search filter
        if (searchTerm.trim()) {
            filtered = filtered.filter((blog) =>
                blog.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filtered = filtered.filter(
                (blog) => blog.type?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        setFilteredBlogs(filtered);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setFilteredBlogs(blogs);
    };

    // Apply filters whenever search term, category, or blogs change
    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedCategory, blogs]);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const getTypeChipColor = (type) => {
        const colors = {
            tech: "primary",
            lifestyle: "secondary",
            travel: "success",
            food: "warning",
            fashion: "error",
            health: "info",
            marketing: "primary",
            "find an idea": "secondary",
            "starting up": "success",
        };
        return colors[type?.toLowerCase()] || "default";
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.1
                )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                py: 4,
            }}
        >
            <Container maxWidth="xl">
                <Fade in timeout={800}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            mb: 4,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: "white",
                            borderRadius: 4,
                            position: "relative",
                            overflow: "hidden",
                            "&::before": {
                                content: '""',
                                position: "absolute",
                                top: 0,
                                right: 0,
                                width: "200px",
                                height: "200px",
                                background: `radial-gradient(circle, ${alpha(
                                    "#fff",
                                    0.1
                                )} 0%, transparent 70%)`,
                                borderRadius: "50%",
                                transform: "translate(50%, -50%)",
                            },
                        }}
                    >
                        <Box
                            display="flex"
                            flexDirection={{xs: "column", sm: "row"}}
                            alignItems={{xs: "flex-start", sm: "center"}}
                            justifyContent="space-between"
                            gap={2}
                            position="relative"
                            zIndex={1}
                            sx={{width: "100%", textAlign: {xs: "center", sm: "left"}}}
                        >
                            <Box
                                display="flex"
                                alignItems="center"
                                flexDirection={{xs: "column", sm: "row"}}
                                gap={2}
                                width="100%"
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: "rgba(255,255,255,0.2)",
                                        width: 56,
                                        height: 56,
                                    }}
                                >
                                    <DashboardIcon fontSize="large"/>
                                </Avatar>

                                <Box>
                                    <Typography
                                        variant="h3"
                                        fontWeight="bold"
                                        sx={{mb: 0.5, fontSize: {xs: "1.8rem", sm: "2.125rem"}}}
                                    >
                                        Blog Admin Panel
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            opacity: 0.9,
                                            fontSize: {xs: "1rem", sm: "1.25rem"},
                                        }}
                                    >
                                        Manage your content with style
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                display="flex"
                                justifyContent={{xs: "center", sm: "flex-end"}}
                                width="100%"
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AddIcon/>}
                                    onClick={handleOpenDialog}
                                    sx={{
                                        bgcolor: "rgba(255,255,255,0.2)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255,255,255,0.3)",
                                        "&:hover": {
                                            bgcolor: "rgba(255,255,255,0.3)",
                                            boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                                        },
                                        transition: "all 0.3s ease",
                                        borderRadius: 3,
                                        px: 3,
                                        py: 1.5,
                                        width: {xs: "100%", sm: "auto"},
                                    }}
                                >
                                    Create New Blog
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>

                <Fade in timeout={1000}>
                    <Paper
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 4,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        }}
                    >
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    placeholder="Search blogs by title..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="primary"/>
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchTerm && (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setSearchTerm("")}
                                                    sx={{"&:hover": {bgcolor: alpha(theme.palette.error.main, 0.1)}}}
                                                >
                                                    <ClearIcon fontSize="small"/>
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 3,
                                            "&:hover": {
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: theme.palette.primary.main,
                                                },
                                            },
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>Category Filter</InputLabel>
                                    <Select
                                        value={selectedCategory}
                                        label="Category Filter"
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <FilterListIcon color="primary" sx={{ml: 1}}/>
                                            </InputAdornment>
                                        }
                                        sx={{
                                            borderRadius: 3,
                                            "& .MuiOutlinedInput-notchedOutline": {
                                                borderRadius: 3,
                                            },
                                        }}
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.value} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={clearFilters}
                                    disabled={!searchTerm && !selectedCategory}
                                    sx={{
                                        borderRadius: 3,
                                        py: 1.5,
                                        "&:hover": {
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                        },
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </Grid>
                        </Grid>

                        {(searchTerm || selectedCategory) && (
                            <Box sx={{mt: 2, display: "flex", gap: 1, flexWrap: "wrap"}}>
                                {searchTerm && (
                                    <Chip
                                        label={`Search: "${searchTerm}"`}
                                        onDelete={() => setSearchTerm("")}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {selectedCategory && (
                                    <Chip
                                        label={`Category: ${categories.find(cat => cat.value === selectedCategory)?.label}`}
                                        onDelete={() => setSelectedCategory("")}
                                        color="secondary"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                <Chip
                                    label={`${filteredBlogs.length} result${filteredBlogs.length !== 1 ? 's' : ''} found`}
                                    color="success"
                                    variant="filled"
                                    size="small"
                                />
                            </Box>
                        )}
                    </Paper>
                </Fade>

                {loading ? (
                    <Fade in timeout={1200}>
                        <Paper sx={{p: 8, textAlign: "center", borderRadius: 4}}>
                            <CircularProgress size={60} thickness={4}/>
                            <Typography variant="h6" sx={{mt: 3, color: "text.secondary"}}>
                                Loading your amazing content...
                            </Typography>
                        </Paper>
                    </Fade>
                ) : (
                    <Slide direction="up" in timeout={1000}>
                        <Paper
                            sx={{
                                borderRadius: 4,
                                overflow: "hidden",
                                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                            }}
                        >
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow
                                            sx={{
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                            }}
                                        >
                                            {[
                                                "Title",
                                                "Type",
                                                "Content Preview",
                                                "Image",
                                                "Actions",
                                            ].map((header) => (
                                                <TableCell
                                                    key={header}
                                                    sx={{
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        fontSize: "1rem",
                                                        py: 3,
                                                    }}
                                                >
                                                    {header}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredBlogs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{py: 8}}>
                                                    <Box>
                                                        <ArticleIcon
                                                            sx={{
                                                                fontSize: 60,
                                                                color: "text.secondary",
                                                                mb: 2,
                                                            }}
                                                        />
                                                        <Typography variant="h6" color="text.secondary">
                                                            {blogs.length === 0
                                                                ? "No blogs available yet"
                                                                : "No blogs match your search criteria"
                                                            }
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{mt: 1}}
                                                        >
                                                            {blogs.length === 0
                                                                ? "Create your first blog to get started!"
                                                                : "Try adjusting your search or filters"
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredBlogs.map((blog) => (
                                                <TableRow
                                                    key={blog._id}
                                                    sx={{
                                                        "&:nth-of-type(even)": {
                                                            bgcolor: alpha(theme.palette.grey[100], 0.5),
                                                        },
                                                    }}
                                                >
                                                    <TableCell sx={{py: 1}}>
                                                        <Typography
                                                            variant="h6"
                                                            fontWeight="600"
                                                            color="primary.main"
                                                        >
                                                            {blog.title}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{py: 1}}>
                                                        <Chip
                                                            label={blog.type}
                                                            color={getTypeChipColor(blog.type)}
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{
                                                                fontWeight: "bold",
                                                                borderRadius: 2,
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{py: 1, maxWidth: 300}}>
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{
                                                                overflow: "hidden",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: "vertical",
                                                                lineHeight: 1.4,
                                                            }}
                                                        >
                                                            {stripHtml(blog.content || "").slice(0, 100)}...
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{py: 1}}>
                                                        {blog.image ? (
                                                            <Avatar
                                                                src={blog.image}
                                                                alt={blog.title}
                                                                variant="rounded"
                                                                sx={{
                                                                    width: 35,
                                                                    height: 35,
                                                                    border: `2px solid ${theme.palette.primary.main}`,
                                                                }}
                                                            />
                                                        ) : (
                                                            <Avatar
                                                                variant="rounded"
                                                                sx={{
                                                                    width: 60,
                                                                    height: 60,
                                                                    bgcolor: alpha(theme.palette.grey[300], 0.5),
                                                                    color: "text.secondary",
                                                                }}
                                                            >
                                                                <ImageIcon/>
                                                            </Avatar>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{py: 1}}>
                                                        <Box display="flex" gap={1}>
                                                            <Tooltip title="View Blog" arrow>
                                                                <IconButton
                                                                    onClick={() => {
                                                                        setViewBlog(blog);
                                                                        setViewOpen(true);
                                                                    }}
                                                                    sx={{
                                                                        bgcolor: alpha(
                                                                            theme.palette.info.main,
                                                                            0.1
                                                                        ),
                                                                        "&:hover": {
                                                                            bgcolor: theme.palette.info.main,
                                                                            color: "white",
                                                                        },
                                                                    }}
                                                                >
                                                                    <ViewIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit Blog" arrow>
                                                                <IconButton
                                                                    onClick={() => handleOpenDialog(blog)}
                                                                    sx={{
                                                                        bgcolor: alpha(
                                                                            theme.palette.primary.main,
                                                                            0.1
                                                                        ),
                                                                        "&:hover": {
                                                                            bgcolor: theme.palette.primary.main,
                                                                            color: "white",
                                                                        },
                                                                    }}
                                                                >
                                                                    <EditIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete Blog" arrow>
                                                                <IconButton
                                                                    onClick={() => handleDelete(blog._id)}
                                                                    sx={{
                                                                        bgcolor: alpha(
                                                                            theme.palette.error.main,
                                                                            0.1
                                                                        ),
                                                                        "&:hover": {
                                                                            bgcolor: theme.palette.error.main,
                                                                            color: "white",
                                                                        },
                                                                    }}
                                                                >
                                                                    <DeleteIcon/>
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Slide>
                )}

                <BlogDialog
                    open={dialogOpen}
                    onClose={handleCloseDialog}
                    formData={formData}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    isEditing={isEditing}
                />

                <Dialog
                    open={viewOpen}
                    onClose={() => setViewOpen(false)}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{sx: {borderRadius: 4}}}
                >
                    <DialogTitle
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: "white",
                            py: 3,
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold">
                            {viewBlog?.title}
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{p: 0}}>
                        {viewBlog?.image && (
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={viewBlog.image}
                                    alt={viewBlog.title}
                                    sx={{objectFit: "cover"}}
                                />
                            </Card>
                        )}
                        <Box sx={{p: 3}}>
                            <Chip
                                label={viewBlog?.type}
                                color={getTypeChipColor(viewBlog?.type)}
                                sx={{mb: 2, fontWeight: "bold"}}
                            />
                            <Divider sx={{my: 2}}/>
                            <Box
                                sx={{lineHeight: 1.8, color: 'text.secondary', typography: 'body1'}}
                                dangerouslySetInnerHTML={{__html: viewBlog?.content || ''}}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions
                        sx={{p: 3, bgcolor: alpha(theme.palette.grey[100], 0.5)}}
                    >
                        <Button
                            onClick={() => setViewOpen(false)}
                            variant="contained"
                            sx={{borderRadius: 2, px: 3}}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={() => setSnackbar({...snackbar, open: false})}
                >
                    <Alert
                        severity={snackbar.severity}
                        onClose={() => setSnackbar({...snackbar, open: false})}
                        sx={{borderRadius: 2}}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default App;