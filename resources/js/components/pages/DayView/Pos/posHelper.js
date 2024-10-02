export const calcCheckTotal = (check) => {
  let subtotal = check.products.reduce(
    (acc, product) => acc + product.pivot.quantity * product.pivot.price,
    0
  )
  let total = subtotal
  if(check.discount_type){
    if(check.discount_type.includes('amount')){
      total -= check.discount
    }else if(check.discount_type.includes('percent')){
      total -= total * check.discount / 100
    }
  }
  return {total: parseFloat(total?.toFixed(2)),subtotal: parseFloat(subtotal?.toFixed(2))}
}
