import './Pos.scss'
import {useTranslation} from "react-i18next";
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem, Select,
  Stack,
  TextField
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useRef, useState} from "react";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from '@mui/icons-material/FileCopy';
import axios from "axios";
import eventBus from "../../../../eventBus";
import ProductCategoryPopup from "./ProductCategoryPopup";
import PosCart from "./PosCart";
import Box from "@mui/material/Box";
import {simpleCatchError} from "../../../../helper";
import StraightIcon from "@mui/icons-material/Straight";

export default function Pos(props){
  const {t} = useTranslation();
  const [editMode, setEditMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(false)
  const [allCategories, setAllCategories] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [paymentMethod, setPaymentMethod] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [productCategoryOpen, setProductCategoryOpen] = useState(false)
  const [editItem, setEditItem] = useState({})
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('id_asc')

  const dragItem = useRef(null)
  const draggedOverItem = useRef(null)

  useEffect( () => {
    function init(){
      getPaymentMethod()
      getCategories()
      getAllCategories()
      getProducts()
    }
    init()
    function placeChanged(){
      init()
      setSelectedCategory(false)
    }
    function updateCategories(categoryId){
      getCategories(categoryId)
      getAllCategories()
    }
    function updateProducts(categoryId){
      getProducts(categoryId)
    }
    eventBus.on("placeChanged", placeChanged)
    eventBus.on("updateCategories", updateCategories)
    eventBus.on("updateProducts", updateProducts)
    return () => {
      eventBus.remove("placeChanged", placeChanged)
      eventBus.remove("updateCategories", updateCategories)
      eventBus.remove("updateProducts", updateProducts)
    }
  }, [])

  useEffect( () => {
    async function loadAll() {
      await getCategories()
      await getProducts()
      setLoading(false)
    }
    loadAll()
  }, [selectedCategory])

  useEffect( () => {
    if(products){
      setProducts(prev => ([...prev.sort(sortProducts)]))
    }
  }, [sort])

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/payment_method`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    })
    setPaymentMethod(res.data)
  }

  const categoryParam = (name,categoryId = false) => {
    let tempCategoryId = categoryId ? categoryId : selectedCategory?.id
    if(tempCategoryId){
      return `?${name}=${tempCategoryId}`
    }else{
      return ''
    }
  }

  const getAllCategories = async () => {
    setLoading(true)
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/product_categories?parent_id=all`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setAllCategories(response.data.map((el) => ({...el,label:el.name})))
      setLoading(false)
    }).catch(error => {
    })
  }

  const getCategories = async (category_id = false) => {
    setLoadingCategories(true)
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/product_categories${categoryParam('parent_id',category_id)}`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      setCategories(prev => ([...response.data]))
      setLoadingCategories(false)
    }).catch(error => {
    })
  }

  const getProducts = async (category_id = false) => {
    setLoadingProducts(true)
    await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/products${categoryParam('product_category_id',category_id)}`,{
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      }
    }).then(response => {
      setProducts(prev => ([...response.data.sort(sortProducts)]))
      setLoadingProducts(false)
    }).catch(error => {
    })
  }

  const sortProducts = (a,b) => {
    let field = 'id'
    let index = 1
    if(sort.includes('az')){
      field = 'name'
    }else if(sort.includes('$')){
      field = 'selling_price'
    }
    if(sort.includes('desc')) index = -1
    if (a[field] < b[field]) return -1*index;
    if (a[field] > b[field]) return 1*index;
    return 0;
  }

  const addNew = () => {
    setProductCategoryOpen(true)
    setEditItem({})
  }

  const categoryClick = (category) => {
    if(!category.id){
      setLoading(true)
      setSelectedCategory(selectedCategory.parent)
    }else {
      if (editMode) {
        setProductCategoryOpen(true)
        setEditItem(category)
      } else {
        setLoading(true)
        setSelectedCategory(category)
      }
    }
  }

  const productClick = (product) => {
    if(editMode){
      setProductCategoryOpen(true)
      setEditItem(product)
    }else{
      eventBus.dispatch("addProductToCart", product)
    }
  }

  const deleteCategory = (e,category) => {
    e.stopPropagation()
    if (window.confirm(t('Are you sure you want to delete this category?'))) {
      axios.delete(`${process.env.MIX_API_URL}/api/product_categories/${category.id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getCategories()
        getAllCategories()
        eventBus.dispatch("notification", {type: 'success', message: 'Product category deleted successfully'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  const deleteProduct = (e,product) => {
    e.stopPropagation()
    if (window.confirm(t('Are you sure you want to delete this product?'))) {
      axios.delete(`${process.env.MIX_API_URL}/api/products/${product.id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        getProducts()
        eventBus.dispatch("notification", {type: 'success', message: 'Product deleted successfully'});
      }).catch(error => {
        eventBus.dispatch("notification", {type: 'error', message: error.message});
        console.log('Error', error)
      })
    }
  }

  const copyProduct = (e,product) => {
    e.stopPropagation()
    setProductCategoryOpen(true)
    let copy = {...product, image_url: null,type: 'product'}
    delete copy.id
    setEditItem(copy)
  }

  const handleSortCategories = (e) => {
    let tempCategories = categories
    const [element] = tempCategories.splice(dragItem.current, 1);
    tempCategories.splice(draggedOverItem.current, 0, element);
    setCategories(prev => ([...tempCategories]))

    axios.post(`${process.env.MIX_API_URL}/api/product_categories/set_position`, {ids: tempCategories.map(el => el.id)}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Category position saved successfully'});
    }).catch(error => {
      simpleCatchError(error)
    })
  }
  const handleSortProducts = (e) => {
    let tempProducts = products
    const [element] = tempProducts.splice(dragItem.current, 1);
    tempProducts.splice(draggedOverItem.current, 0, element);
    setProducts(prev => ([...tempProducts]))

    axios.post(`${process.env.MIX_API_URL}/api/product_categories/${selectedCategory.id}/products/set_position`, {ids: tempProducts.map(el => el.id)}, {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token')
      }
    }).then(response => {
      eventBus.dispatch("notification", {type: 'success', message: 'Product position saved successfully'});
    }).catch(error => {
      simpleCatchError(error)
    })
  }

  const onSearch = (e) => {
    setSearch(e.target.value)
    // setSelectedCategory(false)
    if(e.target.value.length > 2){
      setLoadingProducts(true)
      axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/products?search=${e.target.value}`,{
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token')
        }
      }).then(response => {
        setProducts(prev => ([...response.data]))
        setLoadingProducts(false)
      }).catch(error => {
      })
    }
    if(e.target.value.length === 0){
      getProducts()
    }
  }

  return (<>
    <Dialog className="pos_products" onClose={props.onClose} open={props.open} fullWidth maxWidth="xl"
            scroll="paper"
            PaperProps={{
              style: {
                backgroundColor: "#F2F3F9",
                margin: 0,
                width: '100%'
              },
            }}
    >
      <DialogTitle sx={{m: 0, p: 0}}>
        <></>
        <IconButton onClick={props.onClose} sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          color: (theme) => theme.palette.grey[500],
        }}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={7} lg={8}>
            <Stack spacing={2} mb={2} direction="row" alignItems="center">
              <h5>{t('Products')}</h5>
              <TextField label={t('Search')} size="small"
                         type="text" fullWidth
                         onChange={onSearch}
                         value={search}
              />
              <Select value={sort} size="small"
                      id="sort" name="sort"
                      onChange={(e) => setSort(e.target.value)}>
                <MenuItem value="id_asc">ID<StraightIcon style={{transform:"rotate(180deg)"}}/></MenuItem>
                <MenuItem value="id_desc">ID<StraightIcon/></MenuItem>
                <MenuItem value="az_asc">AZ<StraightIcon style={{transform:"rotate(180deg)"}}/></MenuItem>
                <MenuItem value="az_desc">AZ<StraightIcon/></MenuItem>
                <MenuItem value="$_asc">$<StraightIcon style={{transform:"rotate(180deg)"}}/></MenuItem>
                <MenuItem value="$_desc">$<StraightIcon/></MenuItem>
              </Select>
              <span style={{marginLeft: 'auto'}}></span>
              {['admin'].includes(window.role) && <>{editMode ?
                <>
                  <IconButton onClick={e => {addNew()}}>
                    <AddIcon/>
                  </IconButton>
                  <IconButton onClick={e => {setEditMode(false)}}>
                    <CheckIcon/>
                  </IconButton>
                </>
                :
                <IconButton onClick={e => {setEditMode(true)}}>
                  <EditIcon/>
                </IconButton>
              }</>}
            </Stack>
            <Box style={{height: 'calc(100svh - 155px)',overflowY: 'auto'}}>
              {loading ? <div><CircularProgress/></div> :
                <>
                {search.length === 0 && <div className="products_grid_wrapper">
                    {loadingCategories ? <div><CircularProgress/></div> : <>
                    {[{id: null, name: t('Back')}, ...categories].map((category,key) => {
                      if(selectedCategory || category.id)
                        return <div className="products_item" key={key}
                                    draggable={editMode && category.id != null}
                                    onDragStart={() => dragItem.current = key - 1}
                                    onDragEnter={() => draggedOverItem.current = key - 1}
                                    onDragEnd={handleSortCategories}
                                    onDragOver={(e) => e.preventDefault()}
                                    onClick={(e) => categoryClick(category)}>
                          {editMode && <IconButton className="delete_button" onClick={e => {deleteCategory(e,category)}}><DeleteIcon/></IconButton>}
                          <div className="title" style={{"--product-image": `url('${category.image_url}')`}}>
                          {category.name}
                        </div>
                      </div>
                    })}</>}
                  </div>}
                  <div className="products_grid_wrapper">
                    {loadingProducts ? <div><CircularProgress/></div> : <>
                    {products.map((product,key) => {
                      return <div className="products_item" key={key}
                                  draggable={editMode && !!selectedCategory}
                                  onDragStart={() => dragItem.current = key}
                                  onDragEnter={() => draggedOverItem.current = key}
                                  onDragEnd={handleSortProducts}
                                  onDragOver={(e) => e.preventDefault()}
                                  onClick={(e) => productClick(product)}>
                        {(editMode && product.id) &&
                          <IconButton className="delete_button"
                                      onClick={e => {deleteProduct(e,product)}}><DeleteIcon/></IconButton>}
                        {(editMode && product.id) &&
                          <IconButton className="copy_button"
                                      onClick={e => {copyProduct(e,product)}}><FileCopyIcon/></IconButton>}
                        <div className="title" style={{"--product-image": `url('${product.image_url}')`}}>
                          {product.name}
                        </div>
                        {product.hasOwnProperty('selling_price') &&
                          <div className="product_price">{paymentMethod['online-payment-currency']} {product.selling_price.toFixed(2)}</div>}
                      </div>
                    })}</>}
                  </div>
                </>}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={5} lg={4}>
              <PosCart currency={paymentMethod['online-payment-currency']} order={props.order}/>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
    <ProductCategoryPopup
      open={productCategoryOpen}
      onClose={() => setProductCategoryOpen(false)}
      item={editItem}
      categories={allCategories}
      currentCategory={selectedCategory}
      currency={paymentMethod['online-payment-currency']} />
  </>);
}
