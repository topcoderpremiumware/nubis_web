import './Pos.scss'
import {useTranslation} from "react-i18next";
import {CircularProgress, Dialog, DialogContent, DialogTitle, Grid, IconButton, Stack} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, {useEffect, useState} from "react";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";
import eventBus from "../../../../eventBus";
import CategoryPopup from "./CategoryPopup";
import ProductPopup from "./ProductPopup";

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
    })
    eventBus.on("updateCategories", () => {
      getCategories()
    })
    eventBus.on("updateProducts", () => {
      getProducts()
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
      setCategories(response.data)
      setLoading(false)
    }).catch(error => {
    })
  }

  const getProducts = () => {
    setLoading(true)
    axios.get(`${process.env.MIX_API_URL}/api/places/${localStorage.getItem('place_id')}/products?product_category_id=${selectedCategory}`).then(response => {
      setProducts(response.data)
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
       // TODO: add the product to the cart
      }
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
          <Grid item xs={12} sm={6} md={8}>
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
            {loading ? <div><CircularProgress/></div> :
            <div className="products_grid_wrapper">
              {selectedCategory === false ?
                <>{categories.map((category,key) => {
                  return <div className="products_item" key={key}
                              onClick={(e) => categoryClick(category)}>
                      <div className="title" style={{"--product-image": `url('${category.image_url}')`}}>
                        {category.name}
                      </div>
                    </div>
                  })}</>
                :
                <>{[{id: null, name: t('Back')}, ...products].map((product,key) => {
                  return <div className="products_item" key={key}
                              onClick={(e) => productClick(product)}v>
                    <div className="title" style={{"--product-image": `url('${product.image_url}')`}}>
                      {product.name}
                    </div>
                    {product.hasOwnProperty('selling_price') &&
                      <div className="price">{paymentMethod['online-payment-currency']} {product.selling_price}</div>}
                  </div>
                })}</>
              }
            </div>}
          </Grid>
          <Grid item xs={12} sm={6} md={4}>

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
