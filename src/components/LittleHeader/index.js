import './index.css'
function LittleHeader (props) {
  return (
    <div className="little-header">
      <img src={props.img} alt="" />
      <span>{props.name}</span>
      <div className="little-header-right">
        {props.children ? props.children : ''}
      </div>
    </div>
  )

}
export default LittleHeader