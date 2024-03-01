function deleteBlog(id) {
    fetch(`/blogs/${id}`, {
        method: 'DELETE',
    })
    .then(res => res.json())
    .then(() => {
        const blogElement = document.getElementById(`blog-${id}`);
        blogElement.parentNode.removeChild(blogElement);
    })
    .catch(err => console.error('Error:', err));
}
