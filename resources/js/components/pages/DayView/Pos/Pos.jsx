import './Pos.scss'
import {useTranslation} from "react-i18next";
import {CircularProgress, Dialog, DialogContent, DialogTitle, Grid, IconButton, Stack} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import eventBus from "../../../../eventBus";
import CategoryPopup from "./CategoryPopup";
import ProductPopup from "./ProductPopup";
import PosCart from "./PosCart";
import Box from "@mui/material/Box";

export default function Pos(props){
  const {t} = useTranslation();
  const [editMode, setEditMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(false)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [paymentMethod, setPaymentMethod] = useState({})
  const [loading, setLoading] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [editCategory, setEditCategory] = useState({})
  const [productOpen, setProductOpen] = useState(false)
  const [editProduct, setEditProduct] = useState({})

  useEffect( () => {
    function init(){
      getPaymentMethod()
      getCategories()
      // getProducts()
    }
    init()
    eventBus.on("placeChanged", () => {
      init()
      setSelectedCategory(false)
    })
    eventBus.on("updateCategories", () => {
      getCategories()
    })
    eventBus.on("updateProducts", (category_id) => {
      getProducts(category_id)
    })
  }, [])

  useEffect( () => {
      getProducts()
  }, [selectedCategory])

  const getPaymentMethod = async () => {
    const res = await axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/payment_method`)
    setPaymentMethod(res.data)
  }

  const getCategories = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/product_categories`).then(response => {
      setCategories(prev => ([...response.data]))
      setLoading(false)
    }).catch(error => {
    })
  }

  const getProducts = (category_id = false) => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/products?product_category_id=${category_id || selectedCategory}`).then(response => {
      setProducts(prev => ([...response.data]))
      setLoading(false)
    }).catch(error => {
    })
  }

  const addNew = () => {
    if(selectedCategory === false){
      setCategoryOpen(true)
      setEditCategory({})
    }else{
      setProductOpen(true)
      setEditProduct({
        product_category_id: selectedCategory.id
      })
    }
  }

  const categoryClick = (category) => {
      if(editMode){
        setCategoryOpen(true)
        setEditCategory(category)
      }else{
        setSelectedCategory(category.id)
      }
  }

  const productClick = (product) => {
    if(!product.id){
      setSelectedCategory(false)
    }else{
      if(editMode){
        setProductOpen(true)
        setEditProduct(product)
      }else{
        eventBus.dispatch("addProductToCart", product)
      }
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
              <div className="products_grid_wrapper">
                {selectedCategory === false ?
                  <>{categories.map((category,key) => {
                    return <div className="products_item" key={key}
                                onClick={(e) => categoryClick(category)}>
                        {editMode && <IconButton className="delete_button" onClick={e => {deleteCategory(e,category)}}><DeleteIcon/></IconButton>}
                        <div className="title" style={{"--product-image": `url('${category.image_url}')`}}>
                          {category.name}
                        </div>
                      </div>
                    })}</>
                  :
                  <>{[{id: null, name: t('Back')}, ...products].map((product,key) => {
                    return <div className="products_item" key={key}
                                onClick={(e) => productClick(product)}>
                      {(editMode && product.id) &&
                        <IconButton className="delete_button"
                                    onClick={e => {deleteProduct(e,product)}}><DeleteIcon/></IconButton>}
                      <div className="title" style={{"--product-image": `url('${product.image_url}')`}}>
                        {product.name}
                      </div>
                      {product.hasOwnProperty('selling_price') &&
                        <div className="product_price">{paymentMethod['online-payment-currency']} {product.selling_price.toFixed(2)}</div>}
                    </div>
                  })}</>
                }
              </div>}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={5} lg={4}>
              <PosCart currency={paymentMethod['online-payment-currency']} orderId={props.orderId}/>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
    <CategoryPopup
      open={categoryOpen}
      onClose={() => setCategoryOpen(false)}
      category={editCategory}/>
    <ProductPopup
      open={productOpen}
      onClose={() => setProductOpen(false)}
      product={editProduct}
      categories={categories}
      currency={paymentMethod['online-payment-currency']} />
  </>);
}
