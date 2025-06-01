# Type Reference Key

## Supported Types and Initials

| Type | Initial | Full Name | Example Usage |
|------|---------|-----------|---------------|
| ![Colorless](img/types/Colorless.png) | **C** | Colorless | `C`, `Colorless`, `C x2`, `Colorless x2` |
| ![Dark](img/types/Dark.png) | **D** | Dark/Darkness | `D`, `Dark`, `D x2`, `Dark x2` |
| ![Dragon](img/types/Dragon.png) | **N** | Dragon | `N`, `Dragon`, `N x2`, `Dragon x2` |
| ![Fairy](img/types/Fairy.png) | **Y** | Fairy | `Y`, `Fairy`, `Y x2`, `Fairy x2` |
| ![Fighting](img/types/Fighting.png) | **F** | Fighting | `F`, `Fighting`, `F x2`, `Fighting x2` |
| ![Fire](img/types/Fire.png) | **R** | Fire | `R`, `Fire`, `R x2`, `Fire x2` |
| ![Grass](img/types/Grass.png) | **G** | Grass | `G`, `Grass`, `G x2`, `Grass x2` |
| ![Lightning](img/types/Electric.png) | **L** | Lightning/Electric | `L`, `Lightning`, `L x2`, `Electric x2` |
| ![Metal](img/types/Metal.png) | **M** | Metal | `M`, `Metal`, `M x2`, `Metal x2` |
| ![Psychic](img/types/Psychic.png) | **P** | Psychic | `P`, `Psychic`, `P x2`, `Psychic x2` |
| ![Water](img/types/Water.png) | **W** | Water | `W`, `Water`, `W x2`, `Water x2` |

## Usage Examples

### Attack Costs
- **Comma-separated**: `R,R` or `Fire,Fire` (two Fire energy)
- **Multiplier format**: `Fire x2` or `R x2` (two Fire energy)
- **Mixed format**: `Water x1. Neutral x1` (one Water, one Colorless)
- **Multiple types**: `R,W,C` (Fire, Water, Colorless)

### Weakness
- **With multiplier**: `F x2` or `Fighting x2` (weak to Fighting, damage ×2)
- **Initial format**: `W x2` (weak to Water, damage ×2)

### Resistance
- **With reduction**: `P -30` or `Psychic -30` (resist Psychic, -30 damage)
- **Initial format**: `M -20` (resist Metal, -20 damage)

### Retreat Cost
- **Multiple energies**: `C,C,C` or `Colorless x3` (three Colorless energy)
- **Mixed costs**: `R,C` (one Fire, one Colorless)

## Common Aliases
- **Colorless**: Can also be written as `Neutral` or `Normal`
- **Dark**: Can also be written as `Darkness`
- **Lightning**: Can also be written as `Electric`

## Notes for Data Import
- The system accepts both **full type names** and **single-letter initials**
- Case-insensitive (both `fire` and `Fire` work)
- Multiple energies can be separated by commas: `R,R,C`
- Multiplier format is supported: `Fire x3`
- Mixed formats are supported: `Fire x2. Colorless x1`

## Implementation
This system automatically converts text-based energy costs to visual icons in the card viewer, making it easier to read and understand card costs at a glance. 