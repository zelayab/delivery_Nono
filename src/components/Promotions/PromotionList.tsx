import { Button, Card, Grid, Image, Text } from "@mantine/core";


interface Promotion {
  id: string;
  name: string;
  description: string;
  items?: string[];
  price?: number;
  minAmount?: number;
  percentage?: number;
  available: boolean;
  image?: string;
}



interface PromotionListProps {
  promotions: Promotion[];
  onSelect: (promotion: Promotion) => void;
  showAddButton?: boolean;
  isAdmin?: boolean;
}
const PromotionList = ({
  promotions,
  onSelect,
  showAddButton,
  isAdmin,
 }: PromotionListProps) => {
  return (
    <Grid gutter="lg" p={"1rem"}>
      {promotions.map((promo) => (
        <Grid.Col span={4} key={promo.id}>
          <Card shadow="sm" padding="lg">
            <Card.Section>
              {promo.image && (
              <Image src={promo.image} alt={promo.name} height={160} />
              )}
            </Card.Section>
            <Text w={500} mt="sm">{promo.name}</Text>
            <Text c="dimmed" size="sm">Precio: ${promo.price}</Text>
            {!isAdmin && (
              <Button fullWidth mt="md" onClick={() => onSelect(promo)}>
                Agregar Promoción
              </Button>
            )}
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default PromotionList;